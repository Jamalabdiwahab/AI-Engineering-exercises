import "dotenv/config";
import fs from "fs";
import path from "path";
import readline from "readline";
import { stdin as input, stdout as output } from "node:process";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const rl = readline.createInterface({
  input,
  output
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

const theme = await ask("Enter an image theme: ");

rl.close();

const sizes = [
  "1024x1024",
  "1024x1536",
  "1536x1024",
];

const styles = [
  "natural",
  "vivid",
];

const outputFolder = path.join("images", theme.replace(/\s+/g, "_"));

fs.mkdirSync(outputFolder, { recursive: true });

const metadata = [];


for (const size of sizes) {
  for (const style of styles) {
    console.log(`Generating ${style} (${size})...`);

    const result = await openai.images.generate({
      model: "openai/gpt-image-1",
      prompt: `High quality ${theme}`,
      size,
      quality: "high",
      style,
    });

    const image = result.data[0];

    const filename = `${style}_${size}.png`;
    const filepath = path.join(outputFolder, filename);

    fs.writeFileSync(
      filepath,
      Buffer.from(image.b64_json, "base64")
    );

    metadata.push({
      filename,
      prompt: theme,
      style,
      size,
      quality: "high",
      generatedAt: new Date().toISOString(),
    });

    console.log(`Saved ${filename}`);
  }
}


fs.writeFileSync(
  path.join(outputFolder, "metadata.json"),
  JSON.stringify(metadata, null, 2)
);

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${theme} Gallery</title>

<style>

body{
background:#111;
color:white;
font-family:Arial;
padding:40px;
}

h1{
text-align:center;
}

.grid{
display:grid;
grid-template-columns:repeat(auto-fill,minmax(350px,1fr));
gap:25px;
}

.card{
background:#222;
padding:15px;
border-radius:12px;
}

img{
width:100%;
border-radius:10px;
}

small{
color:#aaa;
}

</style>

</head>

<body>

<h1>${theme} Gallery</h1>

<div class="grid">

${metadata
  .map(
    (img) => `
<div class="card">

<img src="./${theme.replace(/\s+/g, "_")}/${img.filename}" />

<h3>${img.style}</h3>

<p>${img.size}</p>

<small>${img.generatedAt}</small>

</div>
`
  )
  .join("")}

</div>

</body>
</html>
`;

fs.writeFileSync("gallery.html", html);

console.log("\nDone!");
console.log(`Images saved in: ${outputFolder}`);
console.log("Gallery created: gallery.html");