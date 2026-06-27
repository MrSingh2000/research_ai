import {
  StateSchema,
  MessagesAnnotation,
  MessagesValue,
} from "@langchain/langgraph";
import z from "zod";

export const GraphNodeStates = {
  planner: "planner",
  researcher: "researcher",
  summarizer: "summarizer",
  supervisor: "supervisor",
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
      missingTopics: z.array(z.string()),
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

export const RouteSchema = z.object({
  next: z.enum(GraphNodeStates),
  query: z.string(),
});

export const PlannerSchema = z.object({
  plan: z.array(z.string()),
});

export const ResearchFormatterSchema = z.object({
  documents: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      content: z.string(),
    }),
  ),
});

export const SummerizerSchema = z.object({
  summary: z.string(),
});
