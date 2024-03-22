#!/usr/bin/env node

const fs = require("fs");
// get path from the arguments
console.log("=============================");
if (process.env.TRANSLATE_O_TRON_API_KEY === undefined) {
  console.error("TRANSLATE_O_TRON_API_KEY is not set in environment variables");
  process.exit(1);
}
if (process.argv.length < 6) {
  console.error(
    "Usage: npx translate-o-tron-import <projectId> <lang> <operation> <filePath>"
  );
  process.exit(1);
}
const projectId = Number(process.argv[2]);
const lang = process.argv[3];
const operation = process.argv[4];
if (!["sync", "upload", "download"].includes(operation)) {
  console.error("Operation must be 'sync', 'download' or 'upload'");
  process.exit(1);
}
const filePath = process.argv[5];
const isDownload = operation === "download";
const translation = isDownload ? null : JSON.parse(fs.readFileSync(filePath));

console.log(
  `Running with projectId: ${projectId}, lang: ${lang}, operation: ${operation}, filePath: ${filePath}`
);

fetch(`${process.argv[6] ? 'http://localhost:3000' : 'https://trans.mmlab.cz'}/api/terms`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRANSLATE_O_TRON_API_KEY}`,
  },
  body: JSON.stringify({
    projectId,
    lang,
    data: translation,
    operation,
  }),
})
  .then(async (response) => {
    // console.log("Done", response.status);
    const body = await response.json();
    if (isDownload) {
      fs.writeFileSync(
        filePath,
        JSON.stringify(body, Object.keys(body).sort(), 2)
      );
      console.log(
        `Downloaded to ${filePath}, contains ${Object.keys(body).length} terms`
      );
    } else {
      console.log(body);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });
