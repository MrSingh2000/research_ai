import { type ReactAgent, createAgent, toolStrategy } from "langchain";
import { getSearchTools } from "../tools/search-tools";
import { loadSkill } from "../skills/load-skill";
import type { ChatOllama } from "@langchain/ollama";

export const createSearchAgent = async (
  model: ChatOllama,
): Promise<ReactAgent> => {
  const systemPrompt = await loadSkill("researcher");

  /**
   * Not using any strucutred output here as the agent performs multiple calls and unable to transform them into  single doucment
   * This can be fixed but increase complexity and time.
   * Alternatively, used another llm to format the response (check research-formatter.ts)
   */
  return createAgent({
    model,
    tools: getSearchTools(),
    systemPrompt,
  });
};

export default createSearchAgent;
