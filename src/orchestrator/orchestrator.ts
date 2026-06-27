import type { GraphNode } from "@langchain/langgraph";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ReactAgent } from "langchain";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import {
  OrchestratorState,
  PlannerSchema,
  ResearchFormatterSchema,
  RouteSchema,
  SummerizerSchema,
} from "./orchestrator-utils";
import { loadSkill } from "../skills/load-skill";
import { appendFile } from "fs/promises";
import type z from "zod";

const RESEARCH_BATCH_SIZE = 4;

export const createSupervisorNode = (
  llm: BaseChatModel,
): GraphNode<typeof OrchestratorState> => {
  return async (state) => {
    const structuredLlm = llm.withStructuredOutput(RouteSchema);
    const systemPrompt = await loadSkill("supervisor");

    const lastHumanMessage = state.messages.at(-1);
    let humanQuery = "";

    if (typeof lastHumanMessage?.content === "string") {
      humanQuery = lastHumanMessage.content;
    } else if (Array.isArray(lastHumanMessage?.content)) {
      humanQuery =
        (lastHumanMessage?.content as any).find((c: any) => c.type === "text")
          ?.text ?? "";
    }
    const result = await structuredLlm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(humanQuery),
    ]);

    return result;
  };
};

export const createPlannerNode = (
  llm: BaseChatModel,
): GraphNode<typeof OrchestratorState> => {
  return async (state) => {
    const structuredLlm = llm.withStructuredOutput(PlannerSchema);
    const systemPrompt = await loadSkill("planner");

    const res = await structuredLlm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(state.query),
    ]);

    return res;
  };
};

export const createResearchNode = (
  agent: ReactAgent,
  formatter: (
    researches: {
      task: string;
      content: string;
    }[],
  ) => Promise<z.infer<typeof ResearchFormatterSchema>>,
): GraphNode<typeof OrchestratorState> => {
  return async (state) => {
    console.log("entering research node");
    console.dir(state.plan, { depth: null });
    console.dir(state.documents, { depth: null });

    let rawResearches: any = [];

    if (state.plan.length === 0) {
      // if haven't entered the planner flow
      state.plan = [state.query];
    }

    for (let i = 0; i < state.plan.length; i += RESEARCH_BATCH_SIZE) {
      const batch = state.plan.slice(i, i + RESEARCH_BATCH_SIZE);

      const results = await Promise.all(
        batch.map(async (step) => {
          const result = await agent.invoke({
            messages: [new HumanMessage(step)],
          });

          const lastAiMessage = result.messages
            .filter((m) => m.type === "ai")
            .at(-1);

          const rawResearch =
            typeof lastAiMessage?.content === "string"
              ? lastAiMessage.content
              : JSON.stringify(lastAiMessage?.content);

          appendFile(
            "research.log",
            `\n===== ${new Date().toISOString()} =====\n${JSON.stringify(rawResearch, null, 2)}\n`,
          );

          return {
            task: step,
            content: rawResearch,
          };
        }),
      );

      rawResearches = rawResearches.concat(results);
    }

    console.log("before formatting - ", rawResearches?.length);
    const formatted = await formatter(rawResearches);
    console.log("after formatting - ", formatted?.documents?.length);

    return { documents: formatted.documents };
  };
};

export const createSummarizerNode = (
  llm: BaseChatModel,
): GraphNode<typeof OrchestratorState> => {
  return async (state) => {
    console.log("entering summerizer node");
    console.dir(state.documents, { depth: null });

    const structuredLlm = llm.withStructuredOutput(SummerizerSchema);

    const systemPrompt = await loadSkill("summerizer");

    const documentTexts = state.documents
      .map((doc, i) => `Source ${i + 1} (${doc.url}): ${doc.content}`)
      .join("\n\n");

    const res = await structuredLlm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(documentTexts),
    ]);

    return {
      summary: res.summary,
      messages: [new AIMessage(res.summary)],
    };
  };
};
