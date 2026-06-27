export const createGraphStateFactory = () => ({
  messages: [],
  query: "What is LangGraph?",
  plan: ["Research LangGraph"],
  documents: [
    {
      title: "LangGraph",
      url: "https://langchain-ai.github.io/langgraph/",
      content: "LangGraph is a framework for building stateful agents.",
    },
  ],
  summary: "Some summary",
});
