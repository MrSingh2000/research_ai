import { StateGraph } from "@langchain/langgraph";
import { OrchestratorState } from "./orchestrator-utils";
import { createPlannerNode, createResearchNode } from "./orchestrator";

const graph = new StateGraph(OrchestratorState)
  .addNode("planner", createPlannerNode)
  .addNode("researcher", createResearchNode)
  .addEdge("__start__", "planner")
  .addEdge("researcher", "__end__")
  .compile();

export default graph