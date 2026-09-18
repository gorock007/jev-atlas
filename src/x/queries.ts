export interface ResearchQuery {
  name: string;
  query: string;
  rationale: string;
}

export const DEFAULT_QUERIES: ResearchQuery[] = [
  {
    name: "identity",
    query: '("Jev" "TypeSafe AI") -is:retweet lang:en',
    rationale: "Canonical Jev and TypeSafe references",
  },
  {
    name: "system-one",
    query: '("System One Models" OR "RLCD") typesafe -is:retweet lang:en',
    rationale: "Core technical vocabulary and explanations",
  },
  {
    name: "implementations",
    query: '("Jev" typesafe) (github OR demo OR built OR experiment OR code) -is:retweet lang:en',
    rationale: "Concrete projects and experiments",
  },
  {
    name: "performance-limitations",
    query: '("Jev" typesafe) (benchmark OR latency OR cost OR limitation OR accuracy) -is:retweet lang:en',
    rationale: "Evidence, criticism, economics, and constraints",
  },
  {
    name: "architectures",
    query: '("Jev" typesafe) (agent OR routing OR verifier OR classifier OR automation) -is:retweet lang:en',
    rationale: "Architecture patterns and use cases",
  },
];

export function buildQueries(customQueries: string[]): ResearchQuery[] {
  if (customQueries.length === 0) return DEFAULT_QUERIES;
  return customQueries.map((query, index) => ({
    name: `custom-${index + 1}`,
    query,
    rationale: "User-supplied targeted query",
  }));
}

interface QuerySignalPost {
  categories: string[];
  themes: string[];
}

export function buildAdaptiveQueries(posts: QuerySignalPost[]): ResearchQuery[] {
  const count = (terms: string[]) => posts.filter((post) => terms.some((term) => post.categories.includes(term) || post.themes.includes(term))).length;
  const candidates: Array<ResearchQuery & { priority: number }> = [
    {
      name: "adaptive-builds",
      query: '("Jev" typesafe) (github OR "built" OR demo OR prototype OR integration) -is:retweet lang:en',
      rationale: "Exploit observed code, demo, and project signals",
      priority: 20 + count(["CODE", "DEMO", "PROJECT", "EXPERIMENT"]),
    },
    {
      name: "adaptive-evidence",
      query: '("Jev" typesafe) (benchmark OR tested OR accuracy OR calibration OR latency) -is:retweet lang:en',
      rationale: "Seek measurements behind repeated performance claims",
      priority: 18 + count(["BENCHMARK", "PERFORMANCE", "calibration", "latency"]),
    },
    {
      name: "adaptive-criticism",
      query: '("Jev" typesafe) (limitation OR criticism OR skeptical OR failure OR wrong OR tradeoff) -is:retweet lang:en',
      rationale: "Correct the launch-heavy sample with counterevidence and limitations",
      priority: 30 - count(["CRITICISM", "LIMITATION"]),
    },
    {
      name: "adaptive-control",
      query: '("Jev" typesafe) (routing OR verifier OR "tool selection" OR "agent loop") -is:retweet lang:en',
      rationale: "Investigate the dominant control-layer mental model",
      priority: 15 + count(["ROUTING", "VERIFICATION", "AGENT_INFRASTRUCTURE"]),
    },
  ];
  return candidates.sort((a, b) => b.priority - a.priority).map(({ priority: _priority, ...query }) => query);
}
