import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const conversation = [
  {
    speaker: "Alice",
    voice: "coral",
    file: "ex-3/audio/alice.mp3",
    text: "Hey David! Have you tried OpenAI's new text-to-speech model?",
    instructions:
      "Speak cheerfully and energetically. Sound excited to share good news.",
  },
  {
    speaker: "David",
    voice: "ash",
    file: "ex-3/audio/david.mp3",
    text: "Not yet. Is it actually that good?",
    instructions:
      "Speak naturally with curiosity. Slightly slower pace.",
  },
  {
    speaker: "Alice",
    voice: "coral",
    file: "ex-3/audio/alice2.mp3",
    text: "Absolutely! You can even control emotions and speaking style.",
    instructions:
      "Sound confident and enthusiastic. Emphasize the words 'Absolutely' and 'control emotions'.",
  },
  {
    speaker: "David",
    voice: "ash",
    file: "ex-3/audio/david2.mp3",
    text: "That's amazing. I can't wait to build something with it.",
    instructions:
      "Speak with excitement and optimism.",
  },
];

for (const line of conversation) {
  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: line.voice,
    input: line.text,
    instructions: line.instructions,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(line.file, buffer);

  console.log(`Saved ${line.file}`);
}

console.log("Conversation generated!");