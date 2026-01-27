import { mkdir, copyFile, readdir } from "fs/promises";
import path from "path";

const root = process.cwd();
const dist = path.join(root, "src-tauri", "target", "desktop-dist-build");
const serverSrc = path.join(root, "server");
const serverDest = path.join(dist, "server");
const componentsSrc = path.join(root, "components");
const componentsDest = path.join(dist, "components");
const dataSrc = path.join(root, "data");
const dataDest = path.join(dist, "data");

const filesToCopy = ["index.html", "app.js", "styles.css"];
const serverFiles = [
  "bot_compliance.js",
  "bot_intel.js",
  "bot_phishing.js",
  "bot_triage.js",
  "bot_utils.js",
  "bot_webtools.js",
  "command_assist.js",
];

await mkdir(dist, { recursive: true });
await mkdir(serverDest, { recursive: true });
await mkdir(componentsDest, { recursive: true });
await mkdir(dataDest, { recursive: true });

await Promise.all(
  filesToCopy.map((file) => copyFile(path.join(root, file), path.join(dist, file)))
);

await Promise.all(
  serverFiles.map((file) =>
    copyFile(path.join(serverSrc, file), path.join(serverDest, file))
  )
);

async function copyDirectory(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else if (entry.isFile()) {
      await copyFile(srcPath, destPath);
    }
  }
}

// Copy entire components and data directories without deleting existing files (avoids Windows lock issues)
await copyDirectory(componentsSrc, componentsDest);
if (path.resolve(dataSrc) !== path.resolve(dataDest)) {
  await copyDirectory(dataSrc, dataDest);
}

console.log("Desktop assets prepared.");
