export type SearchResult = {
  title: string;
  url: string;
  content: string;
  score: number;
};

export async function searchWeb(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.warn("TAVILY_API_KEY is missing. Web search skipped.");
    return [];
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "advanced",
        include_answer: false,
        include_raw_content: false,
        max_results: 8,
      }),
    });

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Tavily Search Error:", error);
    return [];
  }
}
