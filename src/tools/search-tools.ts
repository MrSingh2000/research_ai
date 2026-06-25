import { tool } from "langchain";
import z from "zod";
import tavilyClient from "../remote/tavily";
import { TavilySearchResponse } from "@tavily/core";
import serpApiClient from "../remote/serp-api";

const webSearch = tool(
  async ({ query }) => {
    const response: TavilySearchResponse = await tavilyClient.search(query);

    return response.results
      .map((result) => ({
        title: result.title,
        content: result.content,
        publishedDate: result.publishedDate,
        url: result.url,
      }))
      .join("\n");
  },
  {
    name: "web_search",
    description: "Search the web for information",
    schema: z.object({
      query: z.string().describe("The query to search the web for"),
    }),
  },
);

const webSearchFallback = tool(
  async ({ query }) => {
    const response = await serpApiClient(query);
    return response.organic_results
      .map((result) => ({
        title: result.title,
        content: result.snippet,
        url: result.link,
      }))
      .join("\n");
  },
  {
    name: "web_search_fallback",
    description:
      "Search the web for information if web_search tool return error",
    schema: z.object({
      query: z.string().describe("The query to search the web for"),
    }),
  },
);

export const getSearchTools = () => [webSearch, webSearchFallback];
