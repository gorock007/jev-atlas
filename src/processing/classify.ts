import type { Category } from "../types.js";

const RULES: Array<[Category, RegExp]> = [
  ["ANNOUNCEMENT", /\b(launch|announc|introduc|released?|available now)\b/iu],
  ["TECHNICAL_EXPLANATION", /\b(architecture|how it works|typed|probabilit|calibrat|sampler|rlcd)\b/iu],
  ["ARCHITECTURE", /\b(architecture|pipeline|control loop|decision layer|workflow)\b/iu],
  ["DEMO", /\b(demo|video|screencast)\b/iu],
  ["CODE", /\b(code|sdk|api|typescript|python|rust|github|repository|repo)\b/iu],
  ["PROJECT", /\b(built|building|project|integration|plugin|library|app)\b/iu],
  ["EXPERIMENT", /\b(experiment|tested?|prototype|proof of concept|poc)\b/iu],
  ["USE_CASE", /\b(use case|using jev|use jev|for jev)\b/iu],
  ["PRODUCT_IDEA", /\b(product idea|could build|imagine|opportunity)\b/iu],
  ["AGENT_INFRASTRUCTURE", /\b(agent|subagent|tool selection|control loop)\b/iu],
  ["ROUTING", /\b(rout(?:e|er|ing)|dispatch|triage)\b/iu],
  ["CLASSIFICATION", /\b(classif|categor|label(?:ing)?)\b/iu],
  ["VERIFICATION", /\b(verif|guardrail|fact.?check|validate)\b/iu],
  ["AUTOMATION", /\b(automat|workflow|event driven)\b/iu],
  ["BENCHMARK", /\b(benchmark|eval(?:uation)?|accuracy|dataset)\b/iu],
  ["PERFORMANCE", /\b(latency|faster|milliseconds?|throughput|performance)\b/iu],
  ["COST", /\b(cost|cheap|pricing|price|economics?|\$\d)\b/iu],
  ["CRITICISM", /\b(hype|misleading|problem|criticism|skeptic|doesn.t work|wrong)\b/iu],
  ["LIMITATION", /\b(limit\w*|struggle\w*|cannot|can't|failure\w*|trade.?off\w*|downside\w*)\b/iu],
  ["COMPARISON", /\b(compared? (?:to|with)|versus|\bvs\.?\b|unlike|replacement)\b/iu],
  ["SPECULATION", /\b(might|maybe|could|potentially|i think|prediction)\b/iu],
  ["QUESTION", /\?/u],
];

export function classify(text: string): Category[] {
  const matches = RULES.filter(([, pattern]) => pattern.test(text)).map(([category]) => category);
  return matches.length > 0 ? [...new Set(matches)] : ["OTHER"];
}
