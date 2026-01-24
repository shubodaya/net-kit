import { applyCorrections, normalizeInput, hasKeyword } from "./bot_utils.js";

const responses = {
  greeting: "Hi! Tell me the framework or control you need.",
  nist: "NIST: specify the control family (AC, AU, IR) and goal.",
  iso: "ISO 27001: specify the control domain and objective.",
  soc2: "SOC 2: tell me the trust principle (Security, Availability, etc.) and control need.",
  pci: "PCI DSS: tell me the requirement number and goal.",
  gdpr: "GDPR: tell me the article or topic you want guidance on.",
  outOfScope:
    "Sorry, that is outside Compliance Helper. I can help with NIST/ISO/SOC2/PCI/GDPR control questions.",
};

export function getComplianceReply(message) {
  const normalized = applyCorrections(normalizeInput(message));
  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized);
  if (isGreeting) return responses.greeting;
  if (hasKeyword(normalized, ["nist"])) return responses.nist;
  if (hasKeyword(normalized, ["iso"])) return responses.iso;
  if (hasKeyword(normalized, ["soc2"])) return responses.soc2;
  if (hasKeyword(normalized, ["pci"])) return responses.pci;
  if (hasKeyword(normalized, ["gdpr"])) return responses.gdpr;
  return responses.outOfScope;
}
