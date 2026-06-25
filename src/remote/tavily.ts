import { tavily } from "@tavily/core";
import appConfig from "../config";

const tavilyClient = tavily({ apiKey: appConfig.tavily.apiKey });

export default tavilyClient;
