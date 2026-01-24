/**
 * Command Formatter - Handles multi-line Cisco IOS command formatting
 * Converts escaped newlines to proper line breaks and adds indentation
 */

/**
 * Format Cisco IOS command with proper line breaks and indentation
 * Preserves hierarchical structure for config modes
 */
export function formatCiscoCommand(command) {
  if (!command) return "";

  // Split by escaped newlines
  let lines = command.split("\\n");

  // If no escaped newlines, check for actual newlines
  if (lines.length === 1) {
    lines = command.split("\n");
  }

  // Process lines to add proper indentation
  const formattedLines = lines.map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return "";

    // Detect hierarchical modes and add indentation
    const indent = detectIndentation(trimmed, index, lines);
    return " ".repeat(indent) + trimmed;
  });

  // Filter out empty lines and join
  return formattedLines.filter((line) => line.trim()).join("\n");
}

/**
 * Detect indentation level based on Cisco IOS keywords
 */
function detectIndentation(line, index, allLines) {
  const lowerLine = line.toLowerCase();

  // Exit commands have zero indent
  if (lowerLine === "end" || lowerLine === "exit") {
    return 0;
  }

  // Config mode entries (zero indent)
  if (
    lowerLine.startsWith("line ") ||
    lowerLine.startsWith("interface ") ||
    lowerLine.startsWith("router ") ||
    lowerLine.startsWith("ip access-list") ||
    lowerLine.startsWith("ip route ") ||
    lowerLine.startsWith("crypto ") ||
    lowerLine.startsWith("policy-map ") ||
    lowerLine.startsWith("class-map ") ||
    lowerLine.startsWith("route-map ")
  ) {
    return 0;
  }

  // Sub-mode entries (1 indent level)
  if (
    lowerLine.startsWith("permit ") ||
    lowerLine.startsWith("deny ") ||
    lowerLine.startsWith("match ") ||
    lowerLine.startsWith("set ") ||
    lowerLine.startsWith("service-policy") ||
    lowerLine.startsWith("bandwidth ") ||
    lowerLine.startsWith("priority ") ||
    lowerLine.startsWith("queue-limit ") ||
    lowerLine.startsWith("key ") ||
    lowerLine.startsWith("cert-chain ") ||
    lowerLine.startsWith("named-key")
  ) {
    return 2; // 2-space indent
  }

  // Default: check if previous line was a mode entry
  if (index > 0) {
    const prevLine = allLines[index - 1]?.toLowerCase().trim() || "";
    if (
      prevLine.startsWith("line ") ||
      prevLine.startsWith("interface ") ||
      prevLine.startsWith("router ")
    ) {
      return 2;
    }
  }

  return 0;
}

/**
 * Prepare command for clipboard copy with proper formatting
 */
export function prepareCommandForCopy(command) {
  return formatCiscoCommand(command);
}

/**
 * Format command for display in HTML (preserves whitespace)
 */
export function formatCommandForDisplay(command) {
  const formatted = formatCiscoCommand(command);
  // Escape HTML entities
  return formatted
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
