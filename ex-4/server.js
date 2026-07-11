import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const rl = readline.createInterface({ input, output });

const folder = "output";

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder);
}

async function generateArticle(topic) {
  console.log("\nGenerating article...\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: `Write a blog article about ${topic}.`,
      },
    ],
  });

  const article = response.choices[0].message.content;

  fs.writeFileSync(path.join(folder, "article.md"), article);

  console.log(article);

  return article;
}

async function generateSummary(article) {
  console.log("\nGenerating summary...\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: `Summarize this article in 3 sentences:\n\n${article}`,
      },
    ],
  });

  const summary = response.choices[0].message.content;

  fs.writeFileSync(path.join(folder, "summary.txt"), summary);

  console.log(summary);
}

async function generateSocialPost(article) {
  console.log("\nGenerating social post...\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: `Write one Twitter post about this article:\n\n${article}`,
      },
    ],
  });

  const post = response.choices[0].message.content;

  fs.writeFileSync(path.join(folder, "twitter.txt"), post);

  console.log(post);
}

async function generateImage(topic) {
  console.log("\nGenerating image...\n");

  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt: `Create a blog header about ${topic}`,
    size: "1024x1024",
  });

  const image = Buffer.from(response.data[0].b64_json, "base64");

  fs.writeFileSync(path.join(folder, "image.png"), image);

  console.log("Image saved.");
}

async function generateAudio(article) {
  console.log("\nGenerating audio...\n");

  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy",
    input: article,
  });

  const audio = Buffer.from(await response.arrayBuffer());

  fs.writeFileSync(path.join(folder, "audio.mp3"), audio);

  console.log("Audio saved.");
}

async function main() {
  const topic = await rl.question("Topic: ");

  const article = await generateArticle(topic);

  await generateSummary(article);

  await generateSocialPost(article);

  await generateImage(topic);

  await generateAudio(article);

  console.log("\nEverything finished!");

  rl.close();
}

main();