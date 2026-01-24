import { applyCorrections, normalizeInput, hasKeyword } from "./bot_utils.js";

const responses = {
  greeting: "Hi! Share the subject, sender, URL, or headers you want checked.",
  header: "Paste key header lines (From, Reply-To, Received) for analysis guidance.",
  link: "Share the suspicious URL and the sender domain so I can review red flags.",
  subject: "Share the full subject line and sender address.",
  attachment: "Share the filename, extension, and any hash if available.",
  outOfScope:
    "Sorry, that is outside Phishing Analyzer. I can review headers, URLs, senders, subjects, and attachments.",
};

export function getPhishingReply(message) {
  const normalized = applyCorrections(normalizeInput(message));
  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized);
  if (isGreeting) return responses.greeting;
  if (hasKeyword(normalized, ["header"])) return responses.header;
  if (hasKeyword(normalized, ["url", "link", "domain"])) return responses.link;
  if (hasKeyword(normalized, ["subject", "sender"])) return responses.subject;
  if (hasKeyword(normalized, ["attachment", "file"])) return responses.attachment;
  return responses.outOfScope;
}
