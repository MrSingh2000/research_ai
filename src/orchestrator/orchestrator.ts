import type { GraphNode } from "@langchain/langgraph";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ReactAgent } from "langchain";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { OrchestratorState } from "./orchestrator-utils";
import { loadSkill } from "../skills/load-skill";
import { appendFile } from "fs/promises";
import type z from "zod";
import {
  RouteSchema,
  PlannerSchema,
  ResearchFormatterSchema,
  SummerizerSchema,
  CriticSchema,
} from "./schema/output-schema";
import { debugLogger } from "../utils/debug-logger";

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

    /**
     * If there are missing topics it came back from critic agent
     */
    const queries =
      state.review.missingTopics.length > 0
        ? state.review.missingTopics.map((topic) => topic.query)
        : state.plan;

    for (let i = 0; i < queries.length; i += RESEARCH_BATCH_SIZE) {
      const batch = queries.slice(i, i + RESEARCH_BATCH_SIZE);

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

          debugLogger("research-result", result);
          debugLogger("raw-research", rawResearch);

          return {
            task: step,
            content: rawResearch,
          };
        }),
      );

      rawResearches = rawResearches.concat(results);
    }

    const formatted = await formatter(rawResearches);

    debugLogger(
      "researcher",
      `raw - ${JSON.stringify(rawResearches)} \nformatted - ${JSON.stringify(formatted)}`,
    );

    return {
      documents: formatted.documents,
      review: {
        complete: false,
        missingTopics: [],
      },
    };
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

    const previousSummary = state.summary;
    const messages =
      previousSummary.length > 0
        ? [
            new SystemMessage(systemPrompt),
            new HumanMessage(`
        You previously created the following summary.

        <previous-summary>
        ${previousSummary}
        </previous-summary>

        The following new research addresses previously missing topics.

        <new-research>
        ${documentTexts}
        </new-research>

        Update the existing summary by integrating only the new information.
        Do not rewrite unchanged sections.
        Preserve the existing structure where possible.
        `),
          ]
        : [new SystemMessage(systemPrompt), new HumanMessage(documentTexts)];

    const res = await structuredLlm.invoke(messages);

    debugLogger("summerize", res.summary);

    return {
      summary: res.summary,
    };
  };
};

export const createCriticNode = (
  llm: BaseChatModel,
): GraphNode<typeof OrchestratorState> => {
  return async (state) => {
    const structuredLlm = llm.withStructuredOutput(CriticSchema);

    const systemPrompt = await loadSkill("critic");

    const documents = JSON.stringify(state.documents);

    const res = await structuredLlm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`
        User query - ${state.query}\n
        ----
        Research - \n
        ${documents}
        `),
    ]);

    debugLogger("critic", res);

    return {
      review: {
        complete: res.complete,
        missingTopics: res.missingTopics,
      },
    };
  };
};

export const createReportNode = (
  llm: BaseChatModel,
): GraphNode<typeof OrchestratorState> => {
  return async (state) => {
    const skill = await loadSkill("report");

    const response = await llm.invoke([
      new SystemMessage(skill),
      new HumanMessage(
        JSON.stringify({
          query: state.query,
          summary: state.summary,
          documents: state.documents,
        }),
      ),
    ]);

    let report = "";
    if (typeof response?.content === "string") {
      report = response.content;
    } else if (Array.isArray(response?.content)) {
      report =
        (response?.content as any).find((c: any) => c.type === "text")?.text ??
        "";
    }

    return {
      report,
      messages: [new AIMessage(report)],
    };
  };
};
