import { sql } from "./db.js";

const PRICING: Record<string, { input: number; output: number }> = {
  "openai/gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
  "openai/text-embedding-3-small": { input: 0.02 / 1_000_000, output: 0 },
};

function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = PRICING[model] || { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 };
  return promptTokens * pricing.input + completionTokens * pricing.output;
}

export async function logApiUsage(params: {
  model: string;
  endpointType: string;
  promptTokens?: number | undefined;
  completionTokens?: number | undefined;
  totalTokens?: number | undefined;
  metadata?: Record<string, any>;
}) {
  const { model, endpointType, promptTokens = 0, completionTokens = 0, totalTokens, metadata } = params;
  const total = totalTokens ?? promptTokens + completionTokens;
  const cost = estimateCost(model, promptTokens, completionTokens);

  try {
    await sql`
      INSERT INTO api_usage (model, endpoint_type, prompt_tokens, completion_tokens, total_tokens, cost, metadata)
      VALUES (${model}, ${endpointType}, ${promptTokens}, ${completionTokens}, ${total}, ${Math.round(cost * 1_000_000) / 1_000_000}, ${metadata ? JSON.stringify(metadata) : null})
    `;
  } catch (err) {
    console.error("[ApiUsage] Failed to log:", err);
  }
}

export async function getApiUsageStats() {
  const [totals] = await sql<[{
    total_calls: string;
    total_tokens: string;
    total_cost: string;
  }?]>`
    SELECT
      COUNT(*)::text AS total_calls,
      COALESCE(SUM(total_tokens), 0)::text AS total_tokens,
      COALESCE(SUM(cost), 0)::text AS total_cost
    FROM api_usage
  `;

  const byModel = await sql<{ model: string; calls: string; tokens: string; cost: string }[]>`
    SELECT model, COUNT(*)::text AS calls, SUM(total_tokens)::text AS tokens, SUM(cost)::text AS cost
    FROM api_usage
    GROUP BY model ORDER BY cost DESC
  `;

  const daily = await sql<{ date: string; calls: string; tokens: string; cost: string }[]>`
    SELECT DATE(created_at)::text AS date, COUNT(*)::text AS calls, SUM(total_tokens)::text AS tokens, SUM(cost)::text AS cost
    FROM api_usage
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at) ORDER BY date DESC
  `;

  const byEndpoint = await sql<{ endpoint_type: string; calls: string; tokens: string; cost: string }[]>`
    SELECT endpoint_type, COUNT(*)::text AS calls, SUM(total_tokens)::text AS tokens, SUM(cost)::text AS cost
    FROM api_usage
    GROUP BY endpoint_type ORDER BY cost DESC
  `;

  return {
    totalCalls: parseInt(totals?.total_calls ?? "0"),
    totalTokens: parseInt(totals?.total_tokens ?? "0"),
    totalCost: parseFloat(totals?.total_cost ?? "0"),
    byModel: byModel.map(r => ({ model: r.model, calls: parseInt(r.calls), tokens: parseInt(r.tokens), cost: parseFloat(r.cost) })),
    daily: daily.map(r => ({ date: r.date, calls: parseInt(r.calls), tokens: parseInt(r.tokens), cost: parseFloat(r.cost) })),
    byEndpoint: byEndpoint.map(r => ({ endpoint: r.endpoint_type, calls: parseInt(r.calls), tokens: parseInt(r.tokens), cost: parseFloat(r.cost) })),
  };
}
