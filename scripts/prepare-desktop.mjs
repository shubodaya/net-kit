import { mkdir, copyFile, cp } from "fs/promises";
import path from "path";

const root = process.cwd();
const dist = path.join(root, "desktop-dist");
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

// Copy entire components and data directories
await cp(componentsSrc, componentsDest, { recursive: true });
if (path.resolve(dataSrc) !== path.resolve(dataDest)) {
  await cp(dataSrc, dataDest, { recursive: true });
}

console.log("Desktop assets prepared.");
