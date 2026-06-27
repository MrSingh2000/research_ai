import ollamaModel from "../model/ollama";
import { MemorySaver } from "@langchain/langgraph";
import createOrchestratorGraph from ".";
import createSearchAgent from "../agents/search-agent";
import { createResearchFormatter } from "../utils/research-formatter";

export const buildGraph = async () => {
  const model = await ollamaModel();

  const searchAgent = await createSearchAgent(model);

  const checkpointer = new MemorySaver();

  const researchFormatter = await createResearchFormatter(model);

  return createOrchestratorGraph(model, searchAgent, checkpointer, researchFormatter);
};
