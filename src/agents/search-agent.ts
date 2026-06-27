import { type ReactAgent, createAgent, toolStrategy } from "langchain";
import { getSearchTools } from "../tools/search-tools";
import { loadSkill } from "../skills/load-skill";
import type { ChatOllama } from "@langchain/ollama";

export const createSearchAgent = async (
  model: ChatOllama,
): Promise<ReactAgent> => {
  const systemPrompt = await loadSkill("researcher");

  return createAgent({
    model,
    tools: getSearchTools(),
    systemPrompt,
  });
};

export default createSearchAgent;
