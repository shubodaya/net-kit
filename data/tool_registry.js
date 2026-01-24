/**
 * Tool Registry - Central registry for all available tools in Cyber Kit
 * Each tool has comprehensive metadata for guided discovery and help
 */

/**
 * Deep Chat Tool Contexts
 * Configuration for tool context display at top of Deep Chat panels
 * Includes summary, expected inputs, and quick example prompts
 */
export const deepChatToolContexts = {
  toolkit: {
    id: "toolkit",
    name: "Tool Kit",
    summary: `Interactive guide for discovering and using all security tools in Cyber Kit. Browse tools by category, view detailed descriptions, try tools instantly.`,
    expectedInputs: "Tool selection from categories (Security, Networking, Analysis, Intelligence, Output, Organization)",
    outputFormat: "Tool interface with real-time analysis, recommendations, and results",
    examplePrompts: [
      "Show me the Password Checker tool",
      "I need to analyze a subnet - what's the best tool?",
      "Which tool can help me check if a URL is safe?",
    ],
  },
  commands: {
    id: "commands",
    name: "Command Assist",
    summary: `Advanced command discovery for network vendors (Cisco, Fortinet, etc.). Browse by vendor and category, view production-grade commands with alternatives, copy-ready CLI syntax.`,
    expectedInputs: "Vendor selection → Category selection → Command action → Advanced alternatives",
    outputFormat: "Multi-line formatted CLI commands with explanations, security considerations, and best practices",
    examplePrompts: [
      "Show me Cisco interface configuration commands",
      "What's the best way to secure VTY lines on a Cisco device?",
      "Configure BGP on a Fortinet device - show me the steps",
    ],
  },
  triage: {
    id: "triage",
    name: "Incident Triage",
    summary: `Guided incident response framework for rapid triage and assessment. Categorize incidents by type and phase, access playbooks, structured investigation steps, and escalation guidelines.`,
    expectedInputs: "Incident type (Malware, DDoS, Breach, etc.) → Response phase (Detect, Contain, Investigate, Recover)",
    outputFormat: "Response playbook, investigation checklist, evidence collection steps, escalation criteria, and next actions",
    examplePrompts: [
      "I think we have a ransomware infection - what should I do?",
      "How do I contain a DDoS attack in progress?",
      "Walk me through forensic evidence collection after a breach",
    ],
  },
  intel: {
    id: "intel",
    name: "Threat Intel Summary",
    summary: `Threat intelligence research and monitoring tool. Query threat databases, review IOC patterns, track campaign intelligence, analyze actor TTPs and motivations.`,
    expectedInputs: "Intelligence focus (Malware families, APT groups, Campaigns) → Depth level (Overview, Technical, Attribution, Strategy)",
    outputFormat: "Summary report with IOCs, TTPs, actor profiles, campaign timeline, threat scores, and detection signatures",
    examplePrompts: [
      "Tell me about the Lazarus Group and their recent campaigns",
      "What malware families are currently targeting the financial sector?",
      "Show me the latest indicators of compromise for Emotet botnet",
    ],
  },
  phishing: {
    id: "phishing",
    name: "Phishing Analyzer",
    summary: `Phishing attack analysis and awareness tool. Analyze suspicious emails/URLs, identify red flags and social engineering tactics, generate awareness training content.`,
    expectedInputs: "Email content or URL → Attack topic (Credential harvesting, Malware delivery, Business Email Compromise, etc.)",
    outputFormat: "Red flag analysis, social engineering tactics breakdown, detection signatures, user training recommendations, and reporting template",
    examplePrompts: [
      "Analyze this suspicious email for phishing indicators",
      "What are the top social engineering tactics in credential phishing?",
      "Create training content to help users spot BEC attacks",
    ],
  },
  compliance: {
    id: "compliance",
    name: "Compliance Helper",
    summary: `Compliance framework guide and requirement tracker. Reference regulatory controls (NIST, ISO, PCI-DSS, HIPAA), map controls to security tools, track compliance status.`,
    expectedInputs: "Compliance framework (NIST CSF, ISO 27001, PCI-DSS, etc.) → Control family or specific requirement",
    outputFormat: "Control description, implementation guidance, mapping to security controls, audit procedures, and evidence documentation",
    examplePrompts: [
      "What NIST controls apply to access control and authentication?",
      "How do I map my tools to PCI-DSS requirements?",
      "Show me the HIPAA security rule requirements for encryption",
    ],
  },
};

export const toolRegistry = {
  password: {
    id: "password",
    name: "Password Checker",
    icon: "🔐",
    category: "Security",
    purpose: "Analyze password strength and security metrics",
    description:
      "Type a password to get real-time strength feedback, character analysis, entropy calculation, and recommendations for improvement.",
    howToUse: [
      "Enter a password in the text field",
      "Observe the strength meter update in real time",
      "Review feedback on character types, length, and entropy",
      "Use recommendations to improve your password",
    ],
    inputs: "Plain text password (processed client-side, never sent to server)",
    outputs: "Strength score (0-100), entropy bits, character type analysis, improvement tips",
    example: {
      input: "MyP@ssw0rd2024!Secure",
      output: "Strength: 95/100 | Entropy: 138 bits | Character types: 4 | Feedback: Very strong password",
    },
    commonErrors: [
      "Using common dictionary words - add numbers and symbols",
      "Passwords too short - aim for 12+ characters",
      "No special characters - include symbols like !@#$%",
    ],
  },
  subnet: {
    id: "subnet",
    name: "IP Subnet Calculator",
    icon: "🌐",
    category: "Networking",
    purpose: "Calculate network information from CIDR notation",
    description:
      "Enter CIDR notation (e.g., 192.168.1.0/24) to get network mask, usable IPs, broadcast address, and subnet boundaries.",
    howToUse: [
      "Enter CIDR notation like 192.168.1.10/24",
      "Click Calculate",
      "Review network information including mask, gateway, range, and usable hosts",
      "Save results to session if needed",
    ],
    inputs: "CIDR notation (e.g., 10.0.0.0/8, 172.16.0.0/12)",
    outputs: "Network address, netmask, broadcast, first usable IP, last usable IP, total hosts, usable hosts",
    example: {
      input: "192.168.1.0/24",
      output:
        "Network: 192.168.1.0 | Mask: 255.255.255.0 | Usable: 192.168.1.1-254 | Broadcast: 192.168.1.255 | Hosts: 254",
    },
    commonErrors: [
      "Invalid CIDR notation - use format XXX.XXX.XXX.XXX/prefix",
      "Prefix out of range - must be 0-32 for IPv4",
      "Missing slash - separate IP and prefix with /",
    ],
  },
  log: {
    id: "log",
    name: "Log Analyzer",
    icon: "📋",
    category: "Analysis",
    purpose: "Parse and analyze log files for errors, IPs, and patterns",
    description:
      "Paste log content to extract errors, warnings, IP addresses, timestamps, and identify common issues or patterns.",
    howToUse: [
      "Paste log file content into the textarea",
      "Click Analyze",
      "Review extracted errors, IPs, timestamps, and pattern summary",
      "Save results to session for reports",
    ],
    inputs: "Raw log file content (syslog, application logs, firewall logs, etc.)",
    outputs: "Error count, warning count, extracted IPs, timestamps, identified patterns, summary statistics",
    example: {
      input: "[2024-01-24 10:30:45] ERROR Connection failed from 192.168.1.100",
      output: "Errors: 1 | IPs: 192.168.1.100 | Timestamps: 2024-01-24 10:30:45 | Key terms: Connection, failed",
    },
    commonErrors: [
      "Empty input - paste actual log content",
      "Unstructured logs - works best with formatted logs",
      "Very large files - may timeout, analyze in sections",
    ],
  },
  url: {
    id: "url",
    name: "URL Safety Checker",
    icon: "🔗",
    category: "Security",
    purpose: "Check URL safety, reputation, and risk factors",
    description: "Enter a full URL (including https://) to check for phishing indicators, malware reputation, and potential threats.",
    howToUse: [
      "Type a complete URL starting with https:// or http://",
      "Click Check URL",
      "Review safety status, risk indicators, and any warnings",
      "Save results to session if conducting security audit",
    ],
    inputs: "Complete URL (e.g., https://example.com/path/to/page)",
    outputs: "Safety status (safe/suspicious/malicious), risk score, warning types, certificate info, reputation",
    example: {
      input: "https://www.example.com/login",
      output: "Status: Safe | Risk: Low | Cert: Valid | Reputation: Good",
    },
    commonErrors: [
      "Missing protocol - include https:// or http://",
      "Incomplete URL - include full path if analyzing specific page",
      "URL encoding issues - spaces should be %20",
    ],
  },
  hash: {
    id: "hash",
    name: "File Hash Checker",
    icon: "🔢",
    category: "Security",
    purpose: "Compute and verify file hashes for integrity checking",
    description:
      "Select a file to compute SHA-256 hash, verify file integrity, or check against known malware databases.",
    howToUse: [
      "Click file picker or drag and drop a file",
      "Tool computes SHA-256 hash automatically",
      "Review hash value and check reputation",
      "Save results if tracking file integrity",
    ],
    inputs: "Any file (processed client-side, not uploaded)",
    outputs: "SHA-256 hash, file size, file type, reputation status (if available)",
    example: {
      input: "document.pdf (2.4 MB)",
      output: "SHA-256: a1b2c3d4e5f6... | Size: 2.4 MB | Status: Clean",
    },
    commonErrors: [
      "Very large files - may be slow, browser dependent",
      "Browser limitations - some older browsers don't support File API",
      "Mismatched hashes - can indicate file corruption or tampering",
    ],
  },
  whois: {
    id: "whois",
    name: "Whois Lookup",
    icon: "👤",
    category: "Intelligence",
    purpose: "Look up domain registration and DNS information",
    description:
      "Enter a domain name (e.g., example.com) to retrieve registration details, registrar, nameservers, and RDAP data.",
    howToUse: [
      "Type a domain name like example.com",
      "Click Lookup",
      "Review registration info, registrar, name servers, and dates",
      "Save results to session for documentation",
    ],
    inputs: "Domain name (e.g., example.com, subdomain.example.org)",
    outputs:
      "Registrar, registrant (if public), creation date, expiration date, nameservers, RDAP data, DNS info",
    example: {
      input: "example.com",
      output:
        "Registrar: VeriSign | Created: 1995-08-15 | Expires: 2025-08-15 | NS: a.iana-servers.net, b.iana-servers.net",
    },
    commonErrors: [
      "Invalid domain format - use only domain, not http://",
      "Non-existent domains - returns not found",
      "Privacy protection - registrant info may be redacted",
    ],
  },
  report: {
    id: "report",
    name: "Report Generation",
    icon: "📄",
    category: "Output",
    purpose: "Generate PDF reports from saved session outputs",
    description:
      "Select a session containing tool outputs, generate a comprehensive PDF report, and export for sharing or archival.",
    howToUse: [
      "Select a session from the dropdown",
      "Click Generate Report",
      "Review report preview in modal",
      "Save local as PDF or copy content",
    ],
    inputs: "Saved session with activity logs and tool outputs",
    outputs: "PDF file with formatted results, timestamps, and analysis summaries",
    example: {
      input: "General session (5 events, 3 tool outputs)",
      output: "cyber-kit-report-2024-01-24.pdf (12 pages)",
    },
    commonErrors: [
      "No sessions available - run some tools first",
      "Session has no outputs - save results from tools to generate content",
      "Large sessions - may take a moment to generate",
    ],
  },
  session: {
    id: "session",
    name: "Session Management",
    icon: "📌",
    category: "Organization",
    purpose: "Create and manage work sessions for tracking and organization",
    description:
      "Create named sessions to group related tool outputs, track activity, and organize your work across multiple tasks.",
    howToUse: [
      "Click New Session to create a session",
      "Name your session (e.g., 'Network Audit Jan 24')",
      "Run tools and they automatically save to the active session",
      "Switch sessions using the dropdown at top",
      "Delete sessions you no longer need",
    ],
    inputs: "Session name (user-defined)",
    outputs: "Timestamped activity log, saved tool outputs, session metadata",
    example: {
      input: "Session: 'Incident Response - Jan 24'",
      output: "Tracks all activities and outputs for this investigation",
    },
    commonErrors: [
      "No active session - create one from the dropdown",
      "Session deleted - activity lost, be careful",
      "Sessions not persisting - browser storage limitations",
    ],
  },
  "wifi-scan": {
    id: "wifi-scan",
    name: "Wi-Fi Scanner",
    icon: "📡",
    category: "Network",
    purpose: "Scan and detect available wireless networks (desktop only)",
    description:
      "Detect and list all available Wi-Fi networks with signal strength, security type, and channel information. Desktop app only.",
    howToUse: [
      "Click Wi-Fi Scanner (desktop app required)",
      "Review detected networks list",
      "Note signal strength, security type, and frequency band",
      "Generate report with findings",
    ],
    inputs: "None - scans local Wi-Fi environment",
    outputs: "Network name, signal strength (dBm), security type (WPA3/WPA2/WEP), channel, frequency band (2.4/5/6 GHz)",
    example: {
      input: "Desktop environment with Wi-Fi",
      output:
        "Networks: Home-Wifi (WPA3, -45dBm), Neighbors-Net (WPA2, -75dBm), OpenWifi (Open, -62dBm) | 12 networks total",
    },
    commonErrors: [
      "Desktop app only - not available in web version",
      "WiFi disabled - enable wireless on your device",
      "Elevated privileges needed - may require admin",
    ],
  },
  "port-scanner": {
    id: "port-scanner",
    name: "Port Scanner",
    icon: "🔍",
    category: "Network",
    purpose: "Check open ports on network devices",
    description: "Scan a host for open ports and services. Useful for security audits and network troubleshooting.",
    howToUse: [
      "Enter a hostname or IP address",
      "Specify port range (e.g., 1-65535)",
      "Click Scan",
      "Review open ports and associated services",
    ],
    inputs: "Target IP/hostname, port range",
    outputs: "List of open ports, detected services, response times, protocol info",
    example: {
      input: "localhost, ports 1-1024",
      output: "Open: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (Node.js)",
    },
    commonErrors: [
      "Network restrictions - firewalls may block scan",
      "Invalid hostname - verify IP or domain",
      "Timeout - host may be unreachable or blocking ICMP",
    ],
  },
  crypto: {
    id: "crypto",
    name: "Cryptography Tools",
    icon: "🔐",
    category: "Security",
    purpose: "Encode, decode, and cryptographic operations",
    description:
      "Perform encryption/decryption, encoding (Base64, Hex), hashing, and other cryptographic operations for security research.",
    howToUse: [
      "Select operation (encode, decode, encrypt, hash, etc.)",
      "Input text or data",
      "Configure parameters (key, algorithm, etc.)",
      "View output and save if needed",
    ],
    inputs: "Text to encode/decode/encrypt/hash",
    outputs: "Transformed data in selected format",
    example: {
      input: "hello world | Operation: Base64 encode",
      output: "aGVsbG8gd29ybGQ=",
    },
    commonErrors: [
      "Invalid characters - check encoding format",
      "Key mismatch - encryption/decryption key must match",
      "Algorithm not supported - use standard algorithms",
    ],
  },
  steganography: {
    id: "steganography",
    name: "Steganography",
    icon: "🖼️",
    category: "Security",
    purpose: "Hide and extract data from images",
    description:
      "Embed secret messages in images or extract hidden data. Useful for covert communication and data hiding research.",
    howToUse: [
      "Upload an image file",
      "Select hide or extract mode",
      "Input secret message to hide",
      "Download image with hidden data or extract message",
    ],
    inputs: "Image file (PNG, JPG) and secret message",
    outputs: "Image with embedded data or extracted message",
    example: {
      input: "image.png + message 'Secret meeting at noon'",
      output: "image-hidden.png (visually identical with embedded message)",
    },
    commonErrors: [
      "File too small - image must have enough data capacity",
      "Lossy compression - use PNG, not JPG for hiding",
      "No message found - data may not be embedded",
    ],
  },
  "speed-test": {
    id: "speed-test",
    name: "Internet Speed Test",
    icon: "⚡",
    category: "Network",
    purpose: "Measure internet connection speed",
    description: "Test your internet connection speed with download, upload, and latency measurements.",
    howToUse: [
      "Click Start Test",
      "Wait for download and upload tests to complete",
      "Review speed results and latency",
      "Save results to session for documentation",
    ],
    inputs: "None - tests connection to public speed test servers",
    outputs: "Download speed (Mbps), upload speed (Mbps), latency (ms), jitter",
    example: {
      input: "Desktop with broadband internet",
      output: "Download: 250 Mbps | Upload: 25 Mbps | Latency: 12 ms",
    },
    commonErrors: [
      "Slow results - may be due to network congestion",
      "Test timeout - try again, servers may be busy",
      "Multiple devices - close other bandwidth-heavy apps",
    ],
  },
  "packet-capture": {
    id: "packet-capture",
    name: "Packet Capture",
    icon: "📦",
    category: "Network",
    purpose: "Capture and analyze network traffic",
    description:
      "Capture network packets on your interface, filter by protocol or address, and analyze traffic patterns. Requires elevated privileges.",
    howToUse: [
      "Select network interface",
      "Configure filters (optional)",
      "Click Start Capture",
      "Review captured packets and statistics",
      "Save capture file for later analysis",
    ],
    inputs: "Network interface selection, optional filters (IP, port, protocol)",
    outputs: "Packet list with src/dst IP, port, protocol, size, flags, payload summary",
    example: {
      input: "eth0, filter: port 443",
      output: "452 packets captured | 89% TLS | 8% DNS | 3% Other",
    },
    commonErrors: [
      "Admin required - packet capture needs elevated privileges",
      "No packets found - check filters or traffic",
      "Large captures - may consume significant memory",
    ],
  },
};

/**
 * Returns tool info by ID
 */
export function getTool(toolId) {
  return toolRegistry[toolId] || null;
}

/**
 * Returns all tools grouped by category
 */
export function getToolsByCategory() {
  const categories = {};
  Object.values(toolRegistry).forEach((tool) => {
    if (!categories[tool.category]) {
      categories[tool.category] = [];
    }
    categories[tool.category].push(tool);
  });
  return categories;
}

/**
 * Returns array of all tools sorted by name
 */
export function getAllTools() {
  return Object.values(toolRegistry).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns array of featured/popular tools
 */
export function getFeaturedTools() {
  const featured = [
    "password",
    "subnet",
    "url",
    "hash",
    "log",
    "whois",
    "report",
    "session",
    "wifi-scan",
    "port-scanner",
  ];
  return featured.map((id) => toolRegistry[id]).filter(Boolean);
}
/**
 * Get Deep Chat tool context by ID
 * @param {string} toolId - The tool ID (toolkit, commands, triage, intel, phishing, compliance)
 * @returns {object|null} Tool context with summary, inputs, outputs, and example prompts
 */
export function getDeepChatToolContext(toolId) {
  return deepChatToolContexts[toolId] || null;
}