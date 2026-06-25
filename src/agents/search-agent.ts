import { createAgent } from "langchain";
import ollamaModel from "../model/ollama";
import { getSearchTools } from "../tools/search-tools";

const searchAgent = createAgent({
  model: ollamaModel,
  tools: getSearchTools(),
  systemPrompt: "You are a search agent, your work is searching the internet about the query user asked using the provided tools. If the primary web_search tools returns any error try the fallback tool."
});

export default searchAgent