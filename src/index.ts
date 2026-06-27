import "dotenv/config";
import * as readline from "node:readline/promises";
import ollamaModel from "./model/ollama";
import { HumanMessage, createAgent } from "langchain";
import { getSearchTools } from "./tools/search-tools";
import { createOrchestratorGraph } from "./orchestrator/graph";
import { MemorySaver } from "@langchain/langgraph";
import { buildGraph } from "./orchestrator/graph-factory";

const rl = readline.createInterface({
  input: process.stdin as unknown as NodeJS.ReadableStream,
  output: process.stdout,
});

async function main() {
  console.log("\nInitializing research agent...\n");

  const graph = await buildGraph();

  const config = {
    configurable: {
      thread_id: "research-session",
    },
  };

  while (true) {
    const query = await rl.question("\nYou: ");

    if (["exit", "quit"].includes(query.toLowerCase())) {
      break;
    }

    console.log("\n--- Researching ---\n");

    const stream = await graph.stream(
      {
        query,
        messages: [new HumanMessage(query)],
      },
      config,
    );

    for await (const chunk of stream) {
      console.dir(chunk, { depth: null });
    }

    const state = await graph.getState(config);

    if (state.values.summary) {
      console.log("\nAssistant:\n");
      console.log(state.values.summary);
    }
  }

  rl.close();
}

main().catch((err: Error) => {
  console.error(err);
  process.exit(1);
});
