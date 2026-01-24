import { applyCorrections, normalizeInput, hasKeyword } from "./bot_utils.js";

const responses = {
  greeting: "Hi! Tell me which Cyber Kit tool you want help with.",
  password: "Use Password checker: type a password to see strength hints and the meter.",
  subnet: "Use IP subnet calculator: enter CIDR like 192.168.1.10/24 and click Calculate.",
  log: "Use Log analyser: paste logs and click Analyze to see errors and IPs.",
  url: "Use URL safety checker: paste full URL (https://...) and click Check URL.",
  hash: "Use File hash checker: choose a file to compute SHA-256.",
  whois: "Use Whois lookup: enter a domain like example.com and click Lookup.",
  report: "Use Report generation: pick a session and click Generate report; then Save local or Export PDF.",
  session: "Use sessions: create a session, select it for tools, and delete when done.",
  outOfScope:
    "Sorry, that is outside the Tool Kit. Ask about password, subnet, logs, URL, hash, whois, reports, or sessions.",
};

export function getWebToolsReply(message) {
  const normalized = applyCorrections(normalizeInput(message));
  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized);
  if (isGreeting) return responses.greeting;
  if (hasKeyword(normalized, ["password"])) return responses.password;
  if (hasKeyword(normalized, ["subnet", "cidr"])) return responses.subnet;
  if (hasKeyword(normalized, ["log"])) return responses.log;
  if (hasKeyword(normalized, ["url"])) return responses.url;
  if (hasKeyword(normalized, ["hash"])) return responses.hash;
  if (hasKeyword(normalized, ["whois", "domain"])) return responses.whois;
  if (hasKeyword(normalized, ["report"])) return responses.report;
  if (hasKeyword(normalized, ["session"])) return responses.session;
  return responses.outOfScope;
}
