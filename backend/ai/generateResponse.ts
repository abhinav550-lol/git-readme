const API_KEY: string = process.env.GROQ_API_KEY || "";
const MODEL = "llama-3.3-70b-versatile";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface SendPromptOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string | string[];
}

interface GroqResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

const DEFAULT_TEMPERATURE = 0.8;
const DEFAULT_MAX_TOKENS = 3000;



const sendPrompt = async (
  systemPrompt: string,
  prompt: string,
  options: SendPromptOptions = {}
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const payload = {
    model: MODEL,
    messages,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    top_p: options.topP,
    stop: options.stop,
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as GroqResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq API returned empty response");
  }

  return content;
};



export { sendPrompt };