import { initChatModel } from "langchain";
import appConfig from "../config";
import { ChatOllama } from "@langchain/ollama";

// const ollamaModel = async () =>
//   initChatModel(appConfig.ollama.model, {
//     modelProvider: "ollama",
//     baseUrl: appConfig.ollama.baseUrl,
//     temperature: 0.5,
//     maxRetries: 4,
//     streaming: true,
//     verbose: true,
//     maxTokens: 4096,
//     timeout: 30,
//   });

const ollamaModel = async () =>
  new ChatOllama({
    model: appConfig.ollama.model,
    baseUrl: appConfig.ollama.baseUrl,
    temperature: 0.5,
    maxRetries: 4,
    streaming: true,
    // verbose: true,
    // maxTokens: 4096,
    // timeout: 30,
  });

export default ollamaModel;
