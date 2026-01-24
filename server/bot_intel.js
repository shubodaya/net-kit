import { applyCorrections, normalizeInput, hasKeyword } from "./bot_utils.js";

const responses = {
  greeting: "Hi! Share IOCs or notes you want summarized.",
  ioc: "Share IOCs and context (source, time) to build a clean summary.",
  ip: "I see an IP. Share source/time and I can group it with other IOCs.",
  domain: "I see a domain. Share source/time and any notes to summarize.",
  hash: "I see a hash. Share file context and detection source.",
  outOfScope: "Sorry, that is outside Threat Intel Summary. I can help summarize IOCs (IPs, domains, hashes).",
};

export function getIntelReply(message) {
  const normalized = applyCorrections(normalizeInput(message));
  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized);
  if (isGreeting) return responses.greeting;
  if (hasKeyword(normalized, ["ioc"])) return responses.ioc;
  if (/\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(normalized)) return responses.ip;
  if (/\b[a-z0-9.-]+\.[a-z]{2,}\b/.test(normalized)) return responses.domain;
  if (/\b[a-f0-9]{32,64}\b/.test(normalized)) return responses.hash;
  return responses.outOfScope;
}
