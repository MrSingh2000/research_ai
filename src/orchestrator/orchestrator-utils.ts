import { StateSchema } from "@langchain/langgraph";
import z from "zod";

export const OrchestratorState = new StateSchema({
  query: z.string(),
  plan: z.array(z.string()).default([]),
  documents: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        content: z.string(),
      }),
    )
    .default([]),
  summary: z.string().default(""),

  review: z
    .object({
      complete: z.boolean(),
      missingTopics: z.array(z.string()),
    })
    .default({
      complete: false,
      missingTopics: [],
    }),

  report: z.string().default(""),
});
