/**
 * Tool Options Registry - Predefined options and templates for all Deep Chat tools
 * Provides unified interface for toolkit, incident triage, threat intel, phishing, and compliance
 */

export const toolOptionsRegistry = {
  toolkit: {
    name: "Tool Kit",
    description: "Explore security tools and utilities",
    icon: "🛠️",
    categories: {
      networking: {
        label: "Networking Tools",
        options: [
          {
            id: "ip-subnet",
            label: "IP Subnet Calculator",
            template: "Network CIDR: ",
            example: "Enter a network like 192.168.1.0/24 to view usable hosts, broadcast, mask, and wildcard.",
            info: "Calculates subnet details (network, broadcast, host range, mask, wildcard, total/usable hosts) for a given IPv4/IPv6 CIDR.",
          },
          {
            id: "ip-scanner",
            label: "IP Scanner",
            template: "Range or CIDR to scan: ",
            example: "Ping sweep 10.0.5.0/24 to discover live hosts and response times.",
            info: "Performs an ICMP ping sweep across a CIDR or start-end range to find responsive hosts and basic latency.",
          },
          {
            id: "port-scanner",
            label: "Port Scanner",
            template: "Host:  \nPorts: ",
            example: "Run TCP connect scan on example.com ports 1-1024.",
            info: "Runs TCP connect scans against a host across a port list/range to identify open services.",
          },
          {
            id: "whois",
            label: "WHOIS Lookup",
            template: "Lookup domain or IP: ",
            example: "Domain: example.com",
            info: "Fetches WHOIS/RDAP registration data for domains or IPs (registrant, registrar, creation/expiry, contacts).",
          },
          {
            id: "wifi-scanner",
            label: "Wi-Fi Scanner",
            template: "Scan for wireless networks",
            example: "List nearby SSIDs with channel, RSSI, and security (WPA2/WPA3/Open).",
            info: "Scans nearby Wi‑Fi networks to list SSIDs, channels, security types, and signal strength for site surveys.",
          },
        ],
      },
      analysis: {
        label: "Analysis Tools",
        options: [
          {
            id: "hash-checker",
            label: "File Hash Checker",
            template: "Hash (MD5/SHA1/SHA256): ",
            example: "Check a SHA256 against reputation sources and display detection counts.",
            info: "Computes or checks file hashes against reputation sources; surfaces detections, first-seen, and metadata.",
          },
          {
            id: "url-checker",
            label: "URL Safety Checker",
            template: "URL to inspect: ",
            example: "Inspect https://login.example.com and flag reputation, redirects, and SSL issues.",
            info: "Evaluates URL reputation, resolves redirects, and inspects SSL metadata to flag phishing/malware risk.",
          },
          {
            id: "log-analyzer",
            label: "Log Analyzer",
            template: "Paste logs. Keywords to highlight: ",
            example: "Paste syslog; highlight 'failed' events and show top source IPs and severities.",
            info: "Parses mixed logs to summarize counts, top IPs, severities, and keyword hits for quick triage.",
          },
          {
            id: "speed-test",
            label: "Speed Test",
            template: "Run network speed test",
            example: "Measure download/upload throughput and latency to the nearest test node.",
            info: "Measures download/upload throughput and latency against a nearby endpoint for connectivity checks.",
          },
        ],
      },
      security: {
        label: "Security Tools",
        options: [
          {
            id: "password-checker",
            label: "Password Strength Checker",
            template: "Password to score (local only): ",
            example: "Score 'Tr0ub4dor&3' for length, entropy, and common patterns (local-only).",
            info: "Locally scores password strength (entropy, length, pattern) and flags common/weak constructs.",
          },
          {
            id: "crypto-tools",
            label: "Cryptography Tools",
            template: "Action (encrypt/decrypt): \nAlgorithm (AES-GCM/ChaCha20-Poly1305): \nData: ",
            example: "Encrypt text with AES-GCM locally and return base64 ciphertext plus IV.",
            info: "Performs local symmetric encryption/decryption with modern ciphers; shows IV/nonce and base64 output.",
          },
          {
            id: "steganography",
            label: "Steganography",
            template: "Hide data in image: ",
            example: "Hide a short secret message inside a PNG cover image and export the stego file.",
            info: "Embeds or extracts hidden text in images for covert transport or detection testing.",
          },
        ],
      },
    },
  },

  incident_triage: {
    name: "Incident Triage",
    description: "Structured incident response and triage workflow",
    icon: "🚨",
    categories: {
      assessment: {
        label: "Assessment",
        options: [
          {
            id: "initial-assessment",
            label: "Initial Assessment",
            template:
              "Initial Assessment Checklist:\nIncident ID:\nReported by / Contact:\nDate & Time detected (UTC):\nIncident type (phishing/malware/breach/other):\nSeverity (Low/Medium/High/Critical):\nBusiness impact (users/systems/data affected):\nScope (hosts/apps/locations):\nCurrent status (ongoing/contained/unknown):\nEvidence summary (alerts, screenshots, logs):\nImmediate actions taken:\nRisks or concerns to flag:\nDecision or approval needed next:",
            example:
              "Type: Phishing | Severity: High | Impact: 5 users | Scope: email + SSO | Status: ongoing | Actions: blocked domain, isolated 2 laptops | Decision: reset SSO + notify execs.",
          },
          {
            id: "containment-checklist",
            label: "Containment Checklist",
            template:
              "Containment Checklist:\n- [ ] Isolate affected hosts (list with owners)\n- [ ] Disable/reset compromised accounts or tokens\n- [ ] Block indicators (IPs/domains/hashes) at firewall/EDR/email\n- [ ] Stop malicious services/processes\n- [ ] Capture volatile evidence before changes\n- [ ] Notify stakeholders (who/when)\nOwner for containment:\nETA to complete:\nNotes / deviations:",
            example:
              "Isolated HR-LAP-22, HR-LAP-24; Blocked C2 203.0.113.10; Reset SSO for 3 users; Evidence captured via Velociraptor.",
          },
          {
            id: "stakeholder-notification",
            label: "Stakeholder Notification",
            template:
              "Stakeholder Notification Draft:\nAudience (Exec/IT/Legal/Comms/Customers):\nOne-line summary (what happened):\nImpact (systems/users/data):\nTime discovered / current status:\nActions taken so far:\nNext planned actions & ETA:\nRisks if no action:\nUpdate cadence and owner:\nApproval required from:",
            example:
              "Audience: Exec + IT + Comms; Summary: Phishing led to SSO credential theft; Impact: 5 users; Status: contained; Next: password resets + MFA review; Updates: every 2h (IR lead).",
          },
        ],
      },
      investigation: {
        label: "Investigation",
        options: [
          {
            id: "artifact-collection",
            label: "Artifact Collection",
            template:
              "Artifact Collection Plan:\nIncident ID:\nHosts in scope (hostname/IP):\nMemory capture (host/time/tool):\nDisk or image captures (scope/tool):\nLogs needed (auth/system/app/network/cloud):\nPCAP capture (interface/duration/filter):\nEmail evidence (headers/body/attachments):\nChain-of-custody notes:\nStorage location and access controls:",
            example:
              "Hosts: HR-LAP-22, HR-LAP-24; Memory: DumpIt 10:30 UTC; Logs: Windows Security + O365 UAL 7d; PCAP: 15 min on WAN; Evidence stored on secured share //ir/evidence/case123.",
          },
          {
            id: "threat-actor-profile",
            label: "Threat Actor Profile",
            template:
              "Threat Actor Profile:\nActor/Group name:\nAliases:\nAttribution confidence (Low/Med/High):\nTarget sectors/regions:\nMotivations:\nKnown TTPs (high-level):\nInfrastructure (IPs/domains/certs/tooling):\nMalware/toolkits observed:\nHistorical campaigns and references:\nAnalyst notes:",
            example:
              "Actor: APT41; Confidence: High; TTPs: spearphish -> cred theft -> C2; Infra: fast-flux .top domains; Tooling: Cobalt Strike; Campaign: 2024 finance targeting (Mandiant FR-24-012).",
          },
          {
            id: "iocs-extraction",
            label: "IOCs Extraction",
            template:
              "IOC Extraction Worksheet:\nSource (email/pcap/log/image):\nIPs:\nDomains/URLs:\nFile hashes (MD5/SHA1/SHA256):\nEmail addresses/senders:\nRegistry keys/process names/services:\nYARA/Sigma candidates:\nFalse positives reviewed? (Yes/No + notes):\nSharing plan (MISP/ISAC/TAXII):",
            example:
              "IPs: 45.77.12.3, 203.0.113.50; Domains: login-office365.support; Hashes: SHA256 abc...; YARA: office_dropper rule drafted; FP review: none; Sharing: push to MISP case 123.",
          },
        ],
      },
      recovery: {
        label: "Recovery",
        options: [
          {
            id: "eradication-plan",
            label: "Eradication Plan",
            template:
              "Eradication Plan:\nRoot cause to address:\nSystems requiring cleanup (list):\nMalware removal steps/tools:\nCredential resets required (which accounts):\nPatching plan (what/when/who):\nValidation and retesting steps:\nOwner and due date:\nRollback/contingency steps:",
            example:
              "Root cause: unpatched Outlook RCE; Cleanup: remove beacon from 6 hosts; Patching: KB5029389 tonight; Validate: full EDR scan + log review; Owner: IR lead; Contingency: network isolation if beacon persists.",
          },
          {
            id: "system-hardening",
            label: "System Hardening",
            template:
              "System Hardening Checklist:\nBaseline target (CIS/NIST/other):\nAccount and MFA changes:\nNetwork controls (firewall/segmentation):\nEndpoint controls (EDR/AV/policies):\nLogging and monitoring enabled (sources/fields):\nBackup status and testing:\nUser communication/training needed:\nSign-off criteria:",
            example:
              "Baseline: CIS L2; Network: block SMB inbound; Endpoint: enforce EDR on all laptops; Logging: forward Sysmon + DNS to SIEM; Backup: verified nightly success; Sign-off: IR + Ops.",
          },
        ],
      },
    },
  },

  threat_intel: {
    name: "Threat Intel Summary",
    description: "Summarize and track threat intelligence",
    icon: "🔍",
    categories: {
      latest_threats: {
        label: "Latest Threats",
        options: [
          {
            id: "zero-day-tracker",
            label: "Zero-Day Tracker",
            template:
              "Zero-Day Tracker Entry:\nCVE/ID:\nVendor / Product / Version:\nAttack vector & prerequisites:\nExploit availability (PoC/In-wild/None):\nDetection ideas (log sources/signals):\nMitigation or workaround:\nPatch status and ETA:\nBusiness exposure (assets affected):\nOwner & next review date:",
            example:
              "CVE-2024-12345 | Exchange 2019 CU14 | RCE via OWA; Exploit: public PoC; Detection: IIS logs 500 + suspicious cmd; Mitigation: disable OWA external; Exposure: 3 internet-facing servers; Review: 2026-01-27.",
          },
          {
            id: "threat-campaign",
            label: "Threat Campaign Tracking",
            template:
              "Threat Campaign Record:\nCampaign name:\nActor/attribution (confidence):\nTimeline (start/end/ongoing):\nTarget sectors/regions:\nPrimary TTPs:\nInfrastructure (IPs/domains/certs):\nMalware/tooling:\nDetection coverage (rules/sensors in place):\nImpact assessment for org:\nAction plan / tasks:",
            example:
              "Campaign: APT41 finance 2026; Timeline: Dec 2025–ongoing; Targets: banking NA/EU; Infra: fast-flux .rest domains; Coverage: IDS rule 2026-012; Actions: block domains, hunt in EDR.",
          },
        ],
      },
      indicators: {
        label: "Indicators & Reputation",
        options: [
          {
            id: "ip-reputation",
            label: "IP Reputation Check",
            template:
              "IP Reputation Worksheet:\nIP address:\nASN / Geo:\nFirst seen / Last seen:\nObserved roles (C2/phish/spam/scanner):\nThreat score / source:\nInternal sightings (logs/alerts):\nBlocks in place (FW/EDR/Email):\nDecision (allow/monitor/block):\nNotes:",
            example:
              "IP: 203.0.113.5, ASN 4134, Geo: CN; Role: C2 per open-source; Internal: 3 EDR beacons; Action: block at edge + EDR.",
          },
          {
            id: "domain-reputation",
            label: "Domain Reputation Check",
            template:
              "Domain Reputation Worksheet:\nDomain:\nRegistrar / Created on:\nHosting / Resolved IPs:\nTLS info (CN/validity):\nPassive DNS notes:\nAbuse history (phish/malware/spam):\nBrand similarity check:\nInternal sightings (email/HTTP/DNS):\nDecision (allow/monitor/block):",
            example:
              "Domain: login-office365.support; Reg: 2026-01-20; IP: 45.77.12.3; Abuse: phishing flagged VT 42/70; Internal: 12 DNS queries; Decision: block + user comms.",
          },
          {
            id: "hash-reputation",
            label: "File Hash Reputation",
            template:
              "File Hash Reputation Worksheet:\nHash (MD5/SHA256):\nFile name / type / size:\nSource (email/url/host):\nFirst seen / Last seen:\nVT or intel score:\nDetection engines flagged:\nSandbox verdict / behaviors:\nPrevalence internally:\nDecision (block/quarantine/allow):",
            example:
              "SHA256: abc...; Type: Windows EXE 2.1MB; Source: user email; VT: 47/70 Trojan; Sandbox: creates run key + C2 https; Decision: quarantine + block hash.",
          },
        ],
      },
      research: {
        label: "Research & Analysis",
        options: [
          {
            id: "mitre-mapping",
            label: "MITRE ATT&CK Mapping",
            template:
              "MITRE ATT&CK Mapping Card:\nUse case / alert:\nTactic:\nTechnique / Sub-technique:\nDetection logic (rule/sensor):\nData required (log source/fields):\nCurrent coverage (Yes/Partial/No):\nGaps and improvements:\nReferences:",
            example:
              "Use case: suspicious O365 login; Tactic: Initial Access; Technique: Phishing T1566.002; Detection: O365 UAL event + impossible travel; Gap: no MFA prompts logged; Improve: enable CA logs.",
          },
          {
            id: "ttp-analysis",
            label: "TTP Analysis",
            template:
              "TTP Analysis Note:\nScenario / Case:\nInitial access:\nExecution:\nPersistence:\nPrivilege escalation:\nDefense evasion:\nCredential access:\nLateral movement:\nExfiltration:\nCommand & control:\nDetection and mitigations per step:",
            example:
              "Scenario: ransomware prep; Initial: phish macro; Execution: powershell; Persistence: run key; Priv esc: token theft; Lateral: SMB/PSExec; Exfil: SFTP; C2: HTTPS 443; Mitigations: restrict PS, EDR rule, block SFTP.",
          },
        ],
      },
    },
  },

  phishing_analyzer: {
    name: "Phishing Analyzer",
    description: "Analyze and classify phishing emails",
    icon: "🎣",
    categories: {
      email_analysis: {
        label: "Email Analysis",
        options: [
          {
            id: "header-inspection",
            label: "Email Header Inspection",
            template:
              "Header Analysis Worksheet:\nFrom address:\nReturn-Path:\nReply-To (mismatch?):\nSender IP / Received chain:\nSPF result:\nDKIM result:\nDMARC policy/result:\nX-Mailer/User-Agent:\nAnomalies noted:",
            example:
              "From: support@trusted-bank.com (spoofed)\nReturn-Path: attacker@evil.com\nSPF: fail; DKIM: none; DMARC: reject\nX-Mailer: PHP mailer; Received: unknown VPS.",
          },
          {
            id: "link-analysis",
            label: "Link Analysis",
            template:
              "URL Inspection Form:\nDisplayed text:\nActual href:\nDomain reputation result:\nURL shortener used? (Y/N):\nRedirect chain observed:\nFinal landing page:\nSandbox verdict / behaviors:\nUser exposure (who clicked):",
            example:
              "Displayed: Click here to verify; Actual: https://ev1l.com/phish.php?id=123; Shortener: bit.ly; Redirects: bit.ly -> 203.0.113.50 -> phishing; Sandbox: steals O365 creds.",
          },
          {
            id: "attachment-analysis",
            label: "Attachment Analysis",
            template:
              "Attachment Analysis Card:\nFilename:\nFile type / size:\nExtension mismatch? (Y/N):\nMacro/active content present? (Y/N):\nAV/VirusTotal detections:\nBehavioral notes (sandbox):\nUser opened? (who/when):\nContainment action:",
            example:
              "File: Invoice_2026.xlsx.exe; Type: PE32; Size: 2.3 MB; Mismatch: yes; VT: 45/70 trojan; Action: quarantined, block hash.",
          },
        ],
      },
      classification: {
        label: "Classification & Triage",
        options: [
          {
            id: "phishing-type",
            label: "Phishing Type Classification",
            template:
              "Phishing Classification:\nType (credential harvest/malware/BEC/data theft):\nTarget department/user set:\nImpersonation of (brand/executive/vendor):\nSophistication (Low/Medium/High):\nLikely motive (financial/data/access):\nUrgency/tone indicators:\nLanguage or branding anomalies:\nRisk rating and rationale:",
            example:
              "Type: Credential harvest; Target: IT helpdesk; Impersonation: Microsoft; Sophistication: Medium; Motive: steal O365 creds; Risk: High.",
          },
          {
            id: "response-template",
            label: "Response Template",
            template:
              "Phishing Response Plan:\nImmediate actions:\n- [ ] Remove email from circulation\n- [ ] Block sender domain/IP\n- [ ] Notify targeted recipients\nUser protection:\n- [ ] Force credential reset if clicked\n- [ ] Check MFA prompts/logs\nMonitoring:\n- [ ] Hunt related IOCs in mail/EDR/HTTP logs\n- [ ] Enable alert for further attempts\nLessons/long-term:\n- [ ] Update mail filtering rule\n- [ ] Add training note\nOwner and ETA:",
            example:
              "Removed: 234 mails; Blocked domain: evil.com; Notified: 450 Marketing users; Forced resets for 12 clicks; Monitoring O365 sign-ins next 48h.",
          },
        ],
      },
      user_education: {
        label: "User Education",
        options: [
          {
            id: "red-flags",
            label: "Red Flags to Teach Users",
            template:
              "User Education: Red Flags Checklist\n- Sender domain slightly off (ex: rnicrosoft.com)\n- Generic greeting (Dear User)\n- Urgent or threatening language\n- Links where hover URL differs from text\n- Requests for passwords/MFA codes/payment cards\n- Unexpected attachments or shared files\n- Unusual sender asking for unusual action\n- Branding or spelling errors\nTeaching note: encourage 'report, don't click'.",
            example:
              "Flag: hover shows 203.0.113.50; Flag: urgent payroll change request; Flag: attachment .exe disguised as .pdf.",
          },
          {
            id: "escalation-procedure",
            label: "Escalation Procedure",
            template:
              "If Suspicious, Do This:\n1) Do not click links or open attachments\n2) Verify sender via separate channel\n3) Forward to security@company.com with subject 'Suspicious email'\n4) Then delete the message\n5) If credentials entered, reset password and inform security\n6) Keep reporting; no blame for caution.",
            example:
              "User forwarded suspicious mail; IR confirmed phish; blocked domain; user praised in newsletter.",
          },
        ],
      },
    },
  },

  compliance_helper: {
    name: "Compliance Helper",
    description: "Check compliance requirements and controls",
    icon: "✓",
    categories: {
      frameworks: {
        label: "Compliance Frameworks",
        options: [
          {
            id: "iso27001",
            label: "ISO 27001 Controls",
            template:
              "ISO 27001 Control Check:\nControl area (A.5-A.18):\nControl objective:\nRequirement text:\nIn-scope assets/processes:\nCurrent status (Compliant/Partial/Non-compliant):\nEvidence collected (docs/logs/screenshots):\nGaps and remediation steps:\nOwner & target date:",
            example:
              "A.9.2.1 User access management; Status: Partial; Gap: no formal approval workflow; Evidence: AD logs only; Remediation: implement ticket-based approval by Feb 15.",
          },
          {
            id: "pci-dss",
            label: "PCI DSS Requirements",
            template:
              "PCI DSS Check:\nRequirement (1-12):\nScope (in/out of CDE):\nTesting method (scan/pen test/interview/doc review):\nFinding (Pass/Fail/NA):\nEvidence collected:\nRemediation plan:\nTarget date:\nOwner:",
            example:
              "Req 1: Firewall config; Scope: In; Method: config review; Finding: Fail (default SNMP); Remediation: migrate to SNMPv3 + ACL; Target: 2026-02-15.",
          },
          {
            id: "hipaa-compliance",
            label: "HIPAA Compliance",
            template:
              "HIPAA Check:\nStandard (Administrative/Physical/Technical):\nRequirement:\nApplies to PHI? (Yes/No):\nCurrent control in place:\nEffectiveness assessment:\nGap/Risk statement:\nRemediation and owner:",
            example:
              "Standard: Technical - Access Control; Applies: Yes (EHR); Control: AD + emergency account; Gap: emergency account use not logged; Owner: IT Ops; Target: add logging in 2 weeks.",
          },
        ],
      },
      controls: {
        label: "Control Implementation",
        options: [
          {
            id: "control-design",
            label: "Control Design & Testing",
            template:
              "Control Design & Test:\nControl objective:\nInput/trigger:\nControl activity description:\nOutput/evidence produced:\nFrequency (Daily/Weekly/Monthly/On-demand):\nOwner:\nTest method (sample size/period):\nTest result (Pass/Fail/Findings):",
            example:
              "Objective: Authorized DB access; Trigger: onboarding/offboarding; Activity: approval workflow; Evidence: ticket + log; Frequency: on-demand; Test: sample 20 changes; Result: Pass.",
          },
          {
            id: "evidence-collection",
            label: "Evidence Collection",
            template:
              "Evidence Collection:\nControl being tested:\nDocuments to gather:\n- Policy / standard\n- Procedures / runbooks\n- Configuration screenshots\n- Audit logs / reports\n- Training records\n- Approvals / sign-off\nTest samples (which systems/changes/users):",
            example:
              "Control: Change management; Evidence: policy v2.1, change tickets, firewall change log 30d, approvals (sample 10); Test: verify approvals present before implementation.",
          },
        ],
      },
      audit_prep: {
        label: "Audit Preparation",
        options: [
          {
            id: "audit-readiness",
            label: "Audit Readiness Assessment",
            template:
              "Pre-Audit Readiness:\nFramework:\nIn-scope systems (list):\nIn-scope personnel (count/teams):\nCritical gaps identified:\nEvidence status (100/75/50/25%):\nRisk rating (Green/Yellow/Red) with rationale:\nTop remediation priorities and owners:",
            example:
              "Framework: ISO 27001; Systems: 15 servers/5 apps; Evidence: 85%; Gaps: DR test missing; Rating: Yellow; Priority: run DR test before March audit.",
          },
          {
            id: "audit-schedule",
            label: "Audit Schedule & Roles",
            template:
              "Audit Planning:\nScope:\nDates (start/end):\nAuditor(s):\nKick-off meeting (date/time):\nData request deadline:\nFacility/virtual tour:\nDebrief date:\nFinal report due:\nInternal owner / coordinator:",
            example:
              "Scope: SOC 2 Type II; Dates: 2026-03-01–03-30; Auditors: Big4; Data due: 2026-02-20; Tour: 2026-03-04; Debrief: 2026-03-28; Coordinator: Compliance lead.",
          },
        ],
      },
    },
  },
};

/**
 * Get all tools in registry
 */
export function getAllToolOptions() {
  return Object.values(toolOptionsRegistry);
}

/**
 * Get specific tool options
 */
export function getToolOptions(toolId) {
  return toolOptionsRegistry[toolId] || null;
}

/**
 * Get categories for a tool
 */
export function getToolCategories(toolId) {
  const tool = getToolOptions(toolId);
  return tool ? Object.entries(tool.categories).map(([key, cat]) => ({ id: key, ...cat })) : [];
}

/**
 * Get all options for a category
 */
export function getCategoryOptions(toolId, categoryId) {
  const tool = getToolOptions(toolId);
  const category = tool?.categories[categoryId];
  return category?.options || [];
}

/**
 * Get a specific option
 */
export function getOption(toolId, categoryId, optionId) {
  const options = getCategoryOptions(toolId, categoryId);
  return options.find((opt) => opt.id === optionId) || null;
}
