import { getJson } from "serpapi";
import appConfig from "../config";

const serpApiClient = async (query: string) =>
  getJson({
    api_key: appConfig.serp.apiKey,
    q: query,
    engine: "google",
    start: 0,
    num: 10,
    hl: "en",
    gl: "us",
    google_domain: "google.com",
  });

export default serpApiClient;
