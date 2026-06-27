import { StateGraph, END, START, MemorySaver } from "@langchain/langgraph";
import {
  OrchestratorState,
  type GraphNodeState,
  ResearchFormatterSchema,
} from "./orchestrator-utils";
import {
  createPlannerNode,
  createResearchNode,
  createSummarizerNode,
  createSupervisorNode,
} from "./orchestrator";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ReactAgent } from "langchain";
import type z from "zod";

export const createOrchestratorGraph = (
  llm: BaseChatModel,
  searchAgent: ReactAgent,
  checkpointer: MemorySaver,
  researchFormatter: (researches: {
    task: string;
    content: string;
  }[]) => Promise<z.infer<typeof ResearchFormatterSchema>>,
): any => {
  const supervisorNode = createSupervisorNode(llm);
  const plannerNode = createPlannerNode(llm);
  const researchNode = createResearchNode(searchAgent, researchFormatter);
  const summarizerNode = createSummarizerNode(llm);

  return new StateGraph(OrchestratorState)
    .addNode("supervisor", supervisorNode)
    .addNode("planner", plannerNode)
    .addNode("researcher", researchNode)
    .addNode("summarizer", summarizerNode)

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
    .addEdge("summarizer", END)
    .compile({
      checkpointer,
    });
};
