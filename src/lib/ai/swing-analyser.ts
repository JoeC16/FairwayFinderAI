import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface SwingFault {
  area: string;
  description: string;
  severity: "minor" | "moderate" | "significant";
}

export interface SwingAnalysis {
  overall: string;
  swingType: string;
  scores: {
    setup: number;
    backswing: number;
    impact: number;
    followThrough: number;
  };
  faults: SwingFault[];
  strengths: string[];
  equipmentImplications: {
    shaftFlex: string;
    loftAdjustment: string;
    clubheadType: string;
    summary: string;
  };
}

const PROMPT = `You are an expert PGA golf instructor with 20+ years of fitting experience.
Analyse the swing images provided (may include address, backswing, impact, follow-through positions).

Return ONLY a valid JSON object — no markdown, no explanation — with this exact structure:
{
  "overall": "2–3 sentence holistic assessment of this golfer's swing",
  "swingType": "one of: upright, flat, neutral, steep, over-the-top, inside-out",
  "scores": {
    "setup": 7,
    "backswing": 6,
    "impact": 8,
    "followThrough": 7
  },
  "faults": [
    {
      "area": "Short descriptive name",
      "description": "What the fault is, why it happens, and its impact on ball flight",
      "severity": "minor"
    }
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "equipmentImplications": {
    "shaftFlex": "Recommended flex and the swing characteristic driving it",
    "loftAdjustment": "More/less/standard loft and why based on swing path and attack angle",
    "clubheadType": "Game improvement / player's cavity / blade / super game improvement and why",
    "summary": "One sentence tying swing characteristics to equipment needs"
  }
}

Scores are integers 1–10. Include 1–4 faults maximum. Include 2–4 strengths.`;

export async function analyseSwing(dataUrls: string[]): Promise<SwingAnalysis> {
  const imageContent: Anthropic.ImageBlockParam[] = dataUrls.map((url) => {
    const match = url.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data URL");
    const [, mediaType, data] = match;
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        data,
      },
    };
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let response: Awaited<ReturnType<typeof client.messages.create>>;
  try {
    response = await client.messages.create(
      {
        model: "claude-opus-4-8",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              ...imageContent,
              { type: "text", text: PROMPT },
            ],
          },
        ],
      },
      { signal: controller.signal },
    );
  } finally {
    clearTimeout(timeout);
  }

  const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
  const jsonStr = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(jsonStr) as SwingAnalysis;
}
