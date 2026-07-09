import "dotenv/config";

import OpenAI from "openai";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const rl = readline.createInterface({
  input,
  output,
});

async function streamResponse(messages, temperature = 0.5) {

    const response = await openai.chat.completions.create({
        model: "openai/gpt-4.1-mini",
        messages,
        temperature,
        stream: true,
        max_completion_tokens: 500,
    })

    let fullResponse = "";

    for await (const chunk of response) {
        const content = chunk.choices[0].delta?.content || "";
        if(content) {
            process.stdout.write(content);
            fullResponse += content;
        }
    }
    console.log("\n");

    return fullResponse;
}

async function main() {

  const topic = await rl.question("Enter a blog topic: ");

  console.log("\nChoose Content Style");
  console.log("1. Factual");
  console.log("2. Creative");

  const choice = await rl.question("\nSelect (1 or 2): ");

  const temperature = choice === "2" ? 1 : 0.2;

  console.log("\nGenerating Blog Outline...\n");

  const outlinePrompt = `
Create a professional blog outline about "${topic}".

Include:

- Blog Title
- Introduction
- Five Main Sections
- Bullet points under each section
- Conclusion
`;

  const outline = await streamResponse(
    [
      {
        role: "user",
        content: outlinePrompt,
      },
    ],
    temperature
  );

  console.log("\nGenerating Summary...\n");

  const summary = await streamResponse([
    {
      role: "system",
      content: "Summarize the following outline into exactly two sentences.",
    },
    {
      role: "user",
      content: outline,
    },
  ]);

  const messages = [
    {
      role: "system",
      content:
        "You are a helpful AI writing assistant. Answer questions using the generated blog outline.",
    },
    {
      role: "assistant",
      content: outline,
    },
  ];

  while (true) {
    const question = await rl.question("\nYou: ");

    if (question.toLowerCase() === "exit") {
      console.log("\nGoodbye!");
      break;
    }

    messages.push({
      role: "user",
      content: question,
    });

    process.stdout.write("\nAI: ");

    const answer = await streamResponse(messages, temperature);

    messages.push({
      role: "assistant",
      content: answer,
    });
  }

  rl.close();
}

main();