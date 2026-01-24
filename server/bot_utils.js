export function normalizeInput(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function applyCorrections(value) {
  return value
    .replace(/\bsubent\b/g, "subnet")
    .replace(/\bsubbnet\b/g, "subnet")
    .replace(/\bwhoos\b/g, "whois")
    .replace(/\bwhos\b/g, "whois")
    .replace(/\breprot\b/g, "report")
    .replace(/\blogg\b/g, "log")
    .replace(/\bosfp\b/g, "ospf")
    .replace(/\bogp\b/g, "bgp")
    .replace(/\bhspr\b/g, "hsrp")
    .replace(/\bvrpp\b/g, "vrrp")
    .replace(/\bintervlan\b/g, "inter vlan");
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

export function fuzzyIncludes(input, keyword) {
  if (input.includes(keyword)) return true;
  const tokens = input.split(" ").filter(Boolean);
  for (const token of tokens) {
    if (token === keyword) return true;
    const limit = keyword.length > 5 ? 2 : 1;
    if (Math.abs(token.length - keyword.length) > limit) continue;
    if (levenshtein(token, keyword) <= limit) return true;
  }
  return false;
}

export function hasKeyword(input, keywords) {
  return keywords.some((keyword) => fuzzyIncludes(input, keyword));
}

export function detectVendor(input) {
  if (input.includes("cisco")) return "cisco";
  if (input.includes("juniper") || input.includes("junos")) return "juniper";
  if (input.includes("mikrotik")) return "mikrotik";
  if (input.includes("arista") || input.includes("nxos")) return "arista";
  return "";
}
