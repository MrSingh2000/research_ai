import z from "zod";
import { GraphNodeStates } from "../orchestrator-utils";

/**
 * Supervisor node output schema
 */
export const RouteSchema = z.object({
  next: z.enum(GraphNodeStates),
  query: z.string(),
});

/**
 * Planner node output schema
 */
export const PlannerSchema = z.object({
  plan: z.array(z.string()),
});

/**
 * Researcher node's formatter output schema
 */
export const ResearchFormatterSchema = z.object({
  documents: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      content: z.string(),
      source: z.enum([
        "documentation",
        "article",
        "paper",
        "news",
        "blog",
        "other",
      ]),
    }),
  ),
});

/**
 * Critic node ouput schema
 */
export const CriticSchema = z
  .object({
    complete: z
      .boolean()
      .describe(
        "Whether the current research completely answers the user's query. Return true only if no additional research is required.",
      ),

    missingTopics: z
      .array(
        z.object({
          topic: z
            .string()
            .describe(
              "Short name of the missing topic, e.g. 'Scalability Comparison'.",
            ),

          query: z
            .string()
            .describe(
              "A complete, standalone research query that can be given directly to a research agent without any additional context.",
            ),

          reason: z
            .string()
            .describe(
              "Why this research is still required and what information is currently missing.",
            ),
        }),
      )
      .describe(
        "List of additional research tasks required to fully answer the user's query. If complete is false, this array MUST contain at least one item. If complete is true, this array MUST be empty.",
      ),

    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe(
        "Confidence that the evaluation is correct. Value between 0 and 1.",
      ),

    feedback: z
      .string()
      .describe(
        "Short explanation describing why the research is or isn't complete. Mention any important gaps that influenced the decision.",
      ),
  })
  .refine((data) => data.complete || data.missingTopics.length > 0, {
    message:
      "missingTopics must contain at least one item when complete is false.",
    path: ["missingTopics"],
  });

/**
 * Summerizer node output schema
 */
export const SummerizerSchema = z.object({
  summary: z.string(),
});
