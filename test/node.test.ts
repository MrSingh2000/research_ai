import { describe, it, expect, vi } from "vitest";
import {
  createPlannerNode,
  createResearchNode,
  createSummarizerNode,
  createSupervisorNode,
} from "../src/orchestrator/orchestrator";
import type { OrchestratorStateType } from "../src/orchestrator/orchestrator-utils";
import { HumanMessage } from "langchain";

const invokeFakeLlm = (mockValue: Partial<OrchestratorStateType>) => {
  const structuredModel = {
    invoke: vi.fn().mockResolvedValue(mockValue),
  };

  return {
    withStructuredOutput: vi.fn().mockReturnValue(structuredModel),
    invoke: vi.fn(async (_messages) => mockValue), // optional if never called directly
    structuredModel,
  };
};

const orchestratorState: OrchestratorStateType = {
  messages: [new HumanMessage("What is Langgraph?")],
  query: "What is MCP?",
  plan: ["Find what MCP is"],
  documents: [],
  review: {
    complete: false,
    missingTopics: [],
  },
  summary: "",
  report: "",
  next: "__start__",
};

describe("Supervisor Node", () => {
  it("should pass the query to planner", async () => {
    const fakeLlm = invokeFakeLlm({
      next: "planner",
      query: "What is Langgraph?",
    });

    const node = createSupervisorNode(fakeLlm as any);

    const result: any = await node({ ...orchestratorState, query: "" }, {});

    expect(fakeLlm.structuredModel.invoke).toHaveBeenCalledTimes(1);

    expect(result.next).toEqual("planner");
  });

  it("should pass the query to researcher", async () => {
    const fakeLlm = invokeFakeLlm({
      next: "researcher",
      query: "Find the latest release notes for LangGraph.",
    });

    const node = createSupervisorNode(fakeLlm as any);

    const result: any = await node({ ...orchestratorState, query: "" }, {});

    expect(fakeLlm.structuredModel.invoke).toHaveBeenCalledTimes(1);

    expect(result.next).toEqual("researcher");
  });
});

describe("Planner node", () => {
  it("should return a list of plan", async () => {
    const fakeLlm = invokeFakeLlm({
      plan: ["query 1", "query 2", "query 3"],
    });

    const node = createPlannerNode(fakeLlm as any);

    const result: any = await node(
      {
        ...orchestratorState,
        plan: [],
      },
      {},
    );

    expect(fakeLlm.structuredModel.invoke).toHaveBeenCalledTimes(1);

    expect(result.plan).toEqual(["query 1", "query 2", "query 3"]);
  });
});

describe("Research node", () => {
  it("should return documents from structured response", async () => {
    const fakeAgent = {
      invoke: vi.fn().mockResolvedValue({
        structuredResponse: {
          title: "MCP",
          url: "https://example.com",
          content: "Some content",

          currentResearchSummary: "summary",
        },
      }),
    };

    const fakeFormatter = vi.fn().mockResolvedValue({ documents: [] });
    const node = createResearchNode(fakeAgent as any, fakeFormatter);

    const result: any = await node(
      {
        query: "What is MCP?",
        plan: ["Find what MCP is"],
        documents: [],
        messages: [],
      } as any,
      {},
    );

    expect(fakeAgent.invoke).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
        documents: [
          {
            title: "MCP",
            url: "https://example.com",
            content: "Some content",
          },
        ],
      });
  });
});

describe("Summerizer Node", () => {
  it("should return a summerized content from documents", async () => {
    const fakeLlm = invokeFakeLlm({
      summary: "Summarized content",
    });

    const node = createSummarizerNode(fakeLlm as any);
    const result: any = await node({ ...orchestratorState, summary: "" }, {});

    expect(fakeLlm.structuredModel.invoke).toHaveBeenCalledTimes(1);

    expect(result.summary).toEqual("Summarized content");
  });
});
