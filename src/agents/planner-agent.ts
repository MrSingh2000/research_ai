import { createAgent } from "langchain";
import ollamaModel from "../model/ollama";

export const plannerAgent = async () => {
  const model = await ollamaModel();
  
  return createAgent({
    model,
    systemPrompt:
      "You are a planning agent. Given a vague or high-level user request, your job is to break it down into clear, concrete, and actionable smaller research tasks that could be handed off to research agents. Make sure each subtask is specific, research-oriented, and covers all necessary aspects to fulfill the original request comprehensively.",
  });
};

export default plannerAgent;
