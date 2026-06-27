/**
 * This file is used for langgraph cli only, you can't pass index file to langgraph
 * because it doesn't want to init terminal or user input while invokation
 */
import { buildGraph } from "./graph-factory";

export const graph = await buildGraph();
