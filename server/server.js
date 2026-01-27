import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fs from "fs";
import { commandLibrary } from "./command_assist.js";
import { applyCorrections, normalizeInput, detectVendor, hasKeyword } from "./bot_utils.js";
import { getWebToolsReply } from "./bot_webtools.js";
import { getTriageReply } from "./bot_triage.js";
import { getIntelReply } from "./bot_intel.js";
import { getPhishingReply } from "./bot_phishing.js";
import { getComplianceReply } from "./bot_compliance.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..");

app.use(express.json({ limit: "128kb" }));
app.use(express.static(publicDir));

const wifiReportDir = path.join(__dirname, "wifi_reports");
if (!fs.existsSync(wifiReportDir)) {
  fs.mkdirSync(wifiReportDir, { recursive: true });
}

function runPythonCandidate(command, commandArgs, scriptPath, args, input) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, [...commandArgs, scriptPath, ...args], { stdio: "pipe" });
    let stdout = "";
    let stderr = "";
    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    process.on("error", (error) => reject(error));
    process.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Python exited with code ${code}`));
      }
      resolve(stdout.trim());
    });
    if (input) {
      process.stdin.write(input);
    }
    process.stdin.end();
  });
}

async function runPython(scriptPath, args = [], input = "") {
  const candidates = [];
  const envPython = process.env.PYTHON_BIN;
  if (envPython) {
    candidates.push({ command: envPython, commandArgs: [] });
  }
  candidates.push({ command: "python", commandArgs: [] });
  candidates.push({ command: "py", commandArgs: ["-3"] });

  let lastError = null;
  for (const candidate of candidates) {
    try {
      return await runPythonCandidate(
        candidate.command,
        candidate.commandArgs,
        scriptPath,
        args,
        input
      );
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("No Python interpreter available.");
}

function countMatches(normalized, keywords) {
  let count = 0;
  keywords.forEach((keyword) => {
    if (hasKeyword(normalized, [keyword])) count += 1;
  });
  return count;
}

app.post("/api/command-assist", (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message : "";
  if (!message.trim()) {
    return res.json({ reply: "Ask a command topic (e.g., OSPF, VLAN, STP, NAT)." });
  }
  const normalized = applyCorrections(normalizeInput(message));
  const vendor = (req.body?.vendor || "").toString().toLowerCase() || detectVendor(normalized);

  let best = null;
  let bestScore = 0;
  commandLibrary.forEach((entry) => {
    const matches = countMatches(normalized, entry.keywords || []);
    if (!matches) return;
    let score = matches * 2;
    if (entry.vendor === vendor) score += 4;
    if (entry.vendor === "any") score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });

  if (!best) {
    return res.json({
      reply:
        "Sorry, that is outside Command Assist. I can help with IOS basics, routing, VLANs, STP, DHCP, ACLs, NAT, IPv6, security, and management commands.",
    });
  }

  if (vendor && best.vendor !== "any" && best.vendor !== vendor) {
    return res.json({
      reply: `I only have ${best.vendor.toUpperCase()} command blocks for this topic right now. Tell me if you want me to add ${vendor.toUpperCase()} examples.`,
    });
  }

  return res.json({ reply: best.response });
});

app.post("/api/bot/:bot", (req, res) => {
  const bot = (req.params.bot || "").toLowerCase();
  const message = typeof req.body?.message === "string" ? req.body.message : "";
  if (!message.trim()) {
    return res.json({ reply: "Ask a question and I will respond." });
  }
  switch (bot) {
    case "general":
      return res.json({ reply: getWebToolsReply(message) });
    case "triage":
      return res.json({ reply: getTriageReply(message) });
    case "intel":
      return res.json({ reply: getIntelReply(message) });
    case "phishing":
      return res.json({ reply: getPhishingReply(message) });
    case "compliance":
      return res.json({ reply: getComplianceReply(message) });
    case "commands":
      return res.redirect(307, "/api/command-assist");
    default:
      return res.json({ reply: "Unknown bot." });
  }
});

app.post("/api/wifi-scan", async (_req, res) => {
  try {
    const output = await runPython(path.join(__dirname, "wifi_scan.py"));
    const payload = JSON.parse(output);
    if (!payload.ok) {
      return res.status(500).json({ error: payload.error || "Scan failed." });
    }
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to scan Wi-Fi." });
  }
});

app.post("/api/wifi-report", async (req, res) => {
  try {
    const filename = `wifi-report-${Date.now()}.pdf`;
    const filePath = path.join(wifiReportDir, filename);
    const output = await runPython(
      path.join(__dirname, "wifi_report.py"),
      [filePath],
      JSON.stringify(req.body || {})
    );
    const payload = JSON.parse(output);
    if (!payload.ok) {
      return res.status(500).json({ error: payload.error || "Report failed." });
    }
    return res.download(filePath, filename);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to generate report." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Net Kit server running on http://localhost:${port}`);
});
