import { tool } from "langchain";
import z from "zod";
import tavilyClient from "../remote/tavily";
import type { TavilySearchResponse } from "@tavily/core";
import serpApiClient from "../remote/serp-api";

const webSearch = tool(
  async ({ query }) => {
    const response: TavilySearchResponse = await tavilyClient.search(query, {
      maxResults: 1,
      chunksPerSource: 1,
    });

    const documents = response.results.map((result) => ({
      title: result.title,
      content: result.content,
      url: result.url,
    }));

    return {
      content: JSON.stringify(documents, null, 2),
    };
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

    const documents = response.organic_results.map((result: any) => ({
      title: result.title,
      content: result.snippet,
      url: result.link,
    }));

    return {
      content: JSON.stringify(documents, null, 2),
    };
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
