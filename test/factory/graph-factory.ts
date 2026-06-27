import { END, START, StateGraph } from "@langchain/langgraph";
import { OrchestratorState, type GraphNodeState } from "../../src/orchestrator/orchestrator-utils";

export const createGraphFactory = () => {
  return new StateGraph(OrchestratorState)
    .addNode("supervisor", () => ({
      next: "planner",
      query: "What is LangGraph?",
    }))
    .addNode("planner", () => ({ plan: ["Research LangGraph"] }))
    .addNode("researcher", () => ({
      documents: [
        {
          title: "LangGraph",
          url: "https://langchain-ai.github.io/langgraph/",
          content: "LangGraph is a framework for building stateful agents.",
        },
      ],
    }))
    .addNode("summarizer", () => ({ summary: "Some summary" }))

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
    .addEdge("summarizer", END);
};