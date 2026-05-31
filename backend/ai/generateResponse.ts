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

const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 3000;


const README_MARKDOWN_STYLE_GUIDELINES = `
README Markdown Style Guidelines:

Typography:
- Use clear and professional GitHub-flavored Markdown.
- Use short, readable sentences.
- Use **bold text** only for important skills, technologies, roles, and keywords.
- Use proper capitalization for technology names, for example JavaScript, TypeScript, React, Node.js, Express.js, MongoDB, Next.js, Python, C++, AI, and Web Development.

Spacing:
- Add one blank line after each heading.
- Add one blank line between paragraphs, HTML blocks, images, and badge sections.
- Never place a Markdown heading immediately after an HTML closing tag.
- Keep the output clean and easy to scan.

Emojis:
- Use relevant emojis in headings when appropriate.
- Use at most one emoji per heading.
- Do not overuse emojis in paragraphs.

GitHub README Compatibility:
- Use Markdown/HTML that works well in GitHub README files.
- Use <p align="center"> or <div align="center"> for centered content.
- Add alt text for all images.
- Avoid unsupported custom CSS when the output is meant for GitHub.
- Do not use script tags, style tags, or unsafe HTML.

Output Rules:
- Return only the final Markdown/HTML.
- Do not include explanations, notes, labels, or extra text.
- Do not wrap the output in code fences.
- Do not invent missing information.
- Keep the design polished, modern, and readable.
`;

const sendPrompt = async (
  systemPrompt: string,
  prompt: string,
  options: SendPromptOptions = {}
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const messages = [
    { role: "system", content: systemPrompt + "\n\n" + README_MARKDOWN_STYLE_GUIDELINES },
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