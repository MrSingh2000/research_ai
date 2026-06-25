const appConfig = {
    ollama: {
        baseUrl: process.env.OLLAMA_BASE_URL,
        model: process.env.OLLAMA_MODEL,
    },
    tavily: {
        apiKey: process.env.TAVILY_API_KEY,
    },
    serp: {
        apiKey: process.env.SERP_API_KEY,
    },
}

export default appConfig;