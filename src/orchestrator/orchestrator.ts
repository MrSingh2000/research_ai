import { GraphNode } from "@langchain/langgraph";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Runnable } from "@langchain/core/runnables";
import { OrchestratorState } from "./orchestrator-utils";

// ------ PLANNER -------
export const createPlannerNode = (llm: BaseChatModel): GraphNode<typeof OrchestratorState> => {
  return async (state) => {
    const msg = await llm.invoke(
      `Break down the following user query into a structured plan of clear, actionable steps, where each step describes a distinct individual search to be performed:\n\n"${state.query}"\n\nReturn the plan as a numbered list.`,
    );
    // TODO: convert the msg to plan here
    return { plan: [] };
  };
};

export const createResearchNode = (agent: Runnable): GraphNode<typeof OrchestratorState> => {
  return async (state) => {
    // For each plan step, invoke the search agent and collect results as documents
    const documents = await Promise.all(
      state.plan.map(async (step: string) => {
        // TODO: provide system prompt to agent to return these values in response
        const result = await agent.invoke({ input: step });

        // Attempt to extract fields assuming result is an object
        if (
          result &&
          typeof result === "object" &&
          "title" in result &&
          "content" in result &&
          "url" in result
        ) {
          return {
            title: result.title ?? step,
            url: result.url ?? "",
            content: result.content ?? "",
          };
        }

        // Fallback if result is a string or unexpected format
        return {
          title: step,
          url: "",
          content: typeof result === "string" ? result : JSON.stringify(result),
        };
      }),
    );

    // Return documents in state update (MUST return, not void)
    return { documents };
  };
};

export const createSummarizerNode = (llm: BaseChatModel): GraphNode<typeof OrchestratorState> => {
  return async (state) => {
    // TODO:
    // Summarize state.documents

    return {
      summary: "",
    };
  };
};
