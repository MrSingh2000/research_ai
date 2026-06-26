import { initChatModel } from "langchain";
import appConfig from "../config";

const ollamaModel = () =>
  initChatModel(appConfig.ollama.model, {
    modelProvider: "ollama",
    baseUrl: appConfig.ollama.baseUrl,
    temperature: 0.5,
    maxRetries: 4,
    streaming: true,
    verbose: true,
    maxTokens: 100000,
    timeout: 30,
  });

export default ollamaModel;
