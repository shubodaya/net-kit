import { applyCorrections, normalizeInput, hasKeyword } from "./bot_utils.js";

const responses = {
  greeting: "Hi! Tell me what happened, when it started, how long it lasted, and the impact.",
  outage:
    "Internet outage triage: confirm scope (single site vs everyone), check ISP status, modem logs, DNS health, and run ping/traceroute to identify where it breaks. What time window, how long, and which services were impacted?",
  ransomware: "Ransomware: isolate systems, identify scope, preserve evidence, notify stakeholders.",
  phishing: "Phishing: isolate affected accounts, reset creds, block sender domains, review logs.",
  malware:
    "Malware triage: isolate the host, collect hashes and process list, check persistence, and scan adjacent systems. What endpoint, alerts, and timeline?",
  breach:
    "Breach triage: identify affected systems, verify access logs, rotate credentials, and preserve evidence. What data was exposed and for how long?",
  outOfScope:
    "Sorry, that is outside Incident Triage. I can help with outages, phishing, ransomware, malware, or breach response.",
};

export function getTriageReply(message) {
  const normalized = applyCorrections(normalizeInput(message));
  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized);
  if (isGreeting) return responses.greeting;
  if (hasKeyword(normalized, ["outage", "internet", "down"])) return responses.outage;
  if (hasKeyword(normalized, ["ransom"])) return responses.ransomware;
  if (hasKeyword(normalized, ["phish"])) return responses.phishing;
  if (hasKeyword(normalized, ["malware"])) return responses.malware;
  if (hasKeyword(normalized, ["breach"])) return responses.breach;
  return responses.outOfScope;
}
