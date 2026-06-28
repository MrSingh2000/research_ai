import { StateSchema, MessagesValue } from "@langchain/langgraph";
import z from "zod";

export const GraphNodeStates = {
  planner: "planner",
  researcher: "researcher",
  summarizer: "summarizer",
  supervisor: "supervisor",
  critic: "critic",
  report: "report",
  start: "__start__",
  end: "__end__",
} as const;

export type GraphNodeState =
  (typeof GraphNodeStates)[keyof typeof GraphNodeStates];

export const OrchestratorState = new StateSchema({
  messages: MessagesValue,
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
      missingTopics: z.array(
        z.object({
          topic: z.string(),
          query: z.string(),
          reason: z.string(),
        }),
      ),
    })
    .default({
      complete: false,
      missingTopics: [],
    }),

  report: z.string().default(""),
  // defines the next agent to call
  next: z.enum(GraphNodeStates).optional(),
});

export type OrchestratorStateType = typeof OrchestratorState.State;
