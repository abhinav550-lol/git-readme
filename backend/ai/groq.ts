import * as fs from "fs";

const prompt = `You are an expert technical writer and GitHub profile README designer specializing in creating visually appealing and professional GitHub profile READMEs for developers.

Your task is to generate a complete GitHub profile README in clean Markdown format using the developer information provided.

The README should look polished, modern, and production-ready — something a professional developer would proudly display on their GitHub profile.

---

STRICT OUTPUT RULES

* Return ONLY Markdown
* Do not include explanations, commentary, or notes
* Do not wrap the output inside code fences
* The output must be ready to paste directly into a GitHub README.md
* Maintain clean formatting and spacing
* Avoid clutter but keep the README visually engaging
* Use a modern developer-friendly tone
* Use Markdown headings, badges, icons, and sections

---

DESIGN GOALS		

* The README should look clean, modern, and professional
* It should be easy to scan quickly
* It should highlight the developer’s skills, projects, and GitHub activity
* Use visual elements such as badges and stat cards
* Emphasize impactful projects
* Ensure the README is suitable for a GitHub profile

---

REQUIRED README STRUCTURE

Follow this structure but improve wording and descriptions where appropriate.

1. Intro / Greeting Section

* Friendly greeting using the developer’s name
* A short professional tagline

2. Professional Summary

* Write 2–4 concise lines describing the developer
* Mention areas like AI, full stack development, competitive programming, system design, or related interests

3. About Me

Use bullet points including:

* What the developer builds
* Areas of technical interest
* Current focus or goals
* Developer location

4. Tech Stack

Display technologies as logo badges instead of text lists.

Use shields.io badge style such as:

![C++](https://img.shields.io/badge/C%2B%2B-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white)

Include badges for:

* Programming languages
* Frameworks
* Databases
* Tools
* Relevant technical concepts

5. Featured Projects

For each project include:

* Project name
* A short description (2–3 lines) explaining the impact of the project
* The tech stack used
* A clickable GitHub repository link

Example format:

Project Name

* Short description of the project and what it does
* What problem it solves or its impact

Tech: React · Node.js · MongoDB
Repository: [https://github.com/username/project](https://github.com/username/project)

6. GitHub Activity / Stats

Include GitHub stat cards using the developer's username.

GitHub Stats card:
[https://github-readme-stats.vercel.app/api?username=USERNAME&show_icons=true&theme=tokyonight](https://github-readme-stats.vercel.app/api?username=USERNAME&show_icons=true&theme=tokyonight)

Top Languages card:
[https://github-readme-stats.vercel.app/api/top-langs/?username=USERNAME&layout=compact&theme=tokyonight](https://github-readme-stats.vercel.app/api/top-langs/?username=USERNAME&layout=compact&theme=tokyonight)

You may optionally include:

* GitHub streak stats
* Contribution graph

7. Connect / Collaboration Section

Use bullet points inviting collaboration.

Include items such as:

* Open to collaboration on AI projects
* Interested in full stack development and developer tools
* Contributions to open source welcome
* Friendly and encouraging closing line

{socials}
---

STYLE GUIDELINES

* Use emojis sparingly
* Avoid unnecessary verbosity
* Use clean spacing between sections
* Use bold text where helpful for readability
* Ensure project descriptions sound impactful and professional
* Do not produce overly long sections

---

INPUT FORMAT

The developer information will be provided in the following structure:

DEVELOPER INFORMATION

Name: {user_name}
GitHub Username: {username}
Bio: {bio}
Location: {location}
Skills: {skills}

PROJECTS

{project_list}

---

YOUR TASK

Using the provided developer information:

* Generate a professional GitHub profile README
* Improve wording where appropriate
* Expand project descriptions slightly so they sound impactful
* Ensure all repository links remain correct
* Maintain clean and visually structured Markdown formatting

Return ONLY the final Markdown README.
`;

const API_KEY: string =
  process.env.GROQ_API_KEY || "";

const MODEL = "llama-3.3-70b-versatile";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

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

async function sendPrompt(promptText: string): Promise<void> {
  if (!API_KEY) {
    console.error("❌ GROQ_API_KEY environment variable is not set.");
    console.error("   1. Get a free key at: https://console.groq.com/keys");
    console.error('   2. Run: export GROQ_API_KEY="your-api-key"');
    process.exit(1);
  }

  console.log(`\n🚀 Sending prompt to Groq (${MODEL})...\n`);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: promptText,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ API Error:", JSON.stringify(error, null, 2));
      process.exit(1);
    }

    const data: GroqResponse = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (text) {
      fs.writeFileSync("output.txt", text, "utf-8");
      console.log("✅ Response saved to output.txt");
      console.log(
        `📊 Tokens used: ${data.usage?.prompt_tokens ?? 0} in / ${
          data.usage?.completion_tokens ?? 0
        } out / ${data.usage?.total_tokens ?? 0} total`
      );
    } else {
      console.error("❌ No response text found.");
      console.log("Raw response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Request failed:", error);
    process.exit(1);
  }
}

// --- Main ---

if (!prompt) {
  console.log("Usage: node groq.js <your prompt>");
  console.log('Example: node groq.js "Explain quantum computing in 3 sentences"');
  process.exit(0);
}

void sendPrompt(prompt);