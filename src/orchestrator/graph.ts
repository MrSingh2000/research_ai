import { StateGraph, END, START, MemorySaver } from "@langchain/langgraph";
import { OrchestratorState, type GraphNodeState } from "./orchestrator-utils";
import {
  createCriticNode,
  createPlannerNode,
  createResearchNode,
  createReportNode,
  createSummarizerNode,
  createSupervisorNode,
} from "./orchestrator";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ReactAgent } from "langchain";
import type z from "zod";
import type { ResearchFormatterSchema } from "./schema/output-schema";

export const createOrchestratorGraph = (
  llm: BaseChatModel,
  searchAgent: ReactAgent,
  checkpointer: MemorySaver,
  researchFormatter: (
    researches: {
      task: string;
      content: string;
    }[],
  ) => Promise<z.infer<typeof ResearchFormatterSchema>>,
): any => {
  const supervisorNode = createSupervisorNode(llm);
  const plannerNode = createPlannerNode(llm);
  const researchNode = createResearchNode(searchAgent, researchFormatter);
  const criticNode = createCriticNode(llm);
  const summarizerNode = createSummarizerNode(llm);
  const reportNode = createReportNode(llm);

  return new StateGraph(OrchestratorState)
    .addNode("supervisor", supervisorNode)
    .addNode("planner", plannerNode)
    .addNode("researcher", researchNode)
    .addNode("critic", criticNode)
    .addNode("summarizer", summarizerNode)
    .addNode("reporter", reportNode)

    .addEdge(START, "supervisor")

    .addConditionalEdges(
      "supervisor",
      (state) => state.next as GraphNodeState,
      {
        planner: "planner",
        researcher: "researcher",
        summarizer: "summarizer",
      },
    )

    .addEdge("planner", "researcher")
    .addEdge("researcher", "summarizer")
    .addConditionalEdges(
      "summarizer",
      (state) => (state.next === "summarizer" ? END : "critic"),
      {
        [END]: END,
        critic: "critic",
      },
    )
    .addConditionalEdges(
      "critic",
      (state) => (state.review.complete ? "report" : "researcher"),
      {
        report: "reporter",
        researcher: "researcher",
      },
    )
    .addEdge("reporter", END)
    .compile({
      checkpointer,
    });
};
