import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ResearchFormatterSchema } from "../orchestrator/orchestrator-utils";
import { loadSkill } from "../skills/load-skill";

const BATCH_SIZE = 5;

export const createResearchFormatter = async (model: ChatOllama) => {
  const formatter = model.withStructuredOutput(ResearchFormatterSchema);

  const systemPrompt = await loadSkill("research_formatter");

  return async (
    researches: {
      task: string;
      content: string;
    }[],
  ) => {
    const batches = [];

    for (let i = 0; i < researches.length; i += BATCH_SIZE) {
      batches.push(researches.slice(i, i + BATCH_SIZE));
    }

    const results = await Promise.all(
      batches.map(async (batch) => {
        return formatter.invoke([
          new SystemMessage(systemPrompt),

          new HumanMessage(
            batch
              .map(
                (r, i) => `
Task ${i + 1}
${r.task}

Research
${r.content}
`,
              )
              .join("\n----------------------\n"),
          ),
        ]);
      }),
    );

    return {
      documents: results.flatMap((r) => r.documents),
    };
  };
};
