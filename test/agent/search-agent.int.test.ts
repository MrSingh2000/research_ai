import { describe, expect, it } from "vitest";
import createSearchAgent from "../../src/agents/search-agent";
import ollamaModel from "../../src/model/ollama";
import { HumanMessage, SystemMessage } from "langchain";

// test.skipIf(!process.env.OLLAMA_BASE_URL || !process.env.OLLAMA_MODEL)(
//     "agent "
// )

describe("Research Agent Integration", () => {
  it("should research query", async () => {
    const model = await ollamaModel();

    const agent = await createSearchAgent(model);

    const result = await agent.invoke(
      {
        messages: [
          new HumanMessage(`
              Understand foundational concepts of multi-agent systems
              `),
        ],
      },
      {
        callbacks: [
          {
            handleLLMStart() {
              console.log("LLM START");
            },

            handleLLMEnd() {
              console.log("LLM END");
            },

            handleToolStart(tool) {
              console.log("TOOL", tool.name);
            },
          },
        ],
      },
    );

    const toolMessages = result.messages.filter((m) => m.type === "tool");

    expect(toolMessages.length).toBeGreaterThan(1);

    expect(result.messages.length).toBeGreaterThan(0);
    expect(result).toHaveProperty("structuredResponse");
    expect(result.structuredResponse).toBeDefined();
    expect(result.structuredResponse.title).toBeDefined();
  }, 120000);
});
