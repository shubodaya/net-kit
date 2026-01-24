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
            template: "Calculate subnet for network: ",
            example: "Network: 192.168.1.0/24",
          },
          {
            id: "ip-scanner",
            label: "IP Scanner",
            template: "Scan network range: ",
            example: "Range: 192.168.1.0-255",
          },
          {
            id: "port-scanner",
            label: "Port Scanner",
            template: "Scan ports on host: ",
            example: "Host: example.com, Ports: 1-1000",
          },
          {
            id: "whois",
            label: "WHOIS Lookup",
            template: "Lookup domain or IP: ",
            example: "Domain: example.com",
          },
          {
            id: "wifi-scanner",
            label: "Wi-Fi Scanner",
            template: "Scan for wireless networks",
            example: "Scanning local area...",
          },
        ],
      },
      analysis: {
        label: "Analysis Tools",
        options: [
          {
            id: "hash-checker",
            label: "File Hash Checker",
            template: "Analyze file hash: ",
            example: "Hash: d41d8cd98f00b204e9800998ecf8427e (MD5)",
          },
          {
            id: "url-checker",
            label: "URL Safety Checker",
            template: "Check URL safety: ",
            example: "URL: https://example.com",
          },
          {
            id: "log-analyzer",
            label: "Log Analyzer",
            template: "Analyze log file for: ",
            example: "Search: error, warning, failed",
          },
          {
            id: "speed-test",
            label: "Speed Test",
            template: "Run network speed test",
            example: "Testing download/upload speeds...",
          },
        ],
      },
      security: {
        label: "Security Tools",
        options: [
          {
            id: "password-checker",
            label: "Password Strength Checker",
            template: "Check password strength: ",
            example: "Criteria: length, complexity, entropy",
          },
          {
            id: "crypto-tools",
            label: "Cryptography Tools",
            template: "Encrypt/Decrypt data using: ",
            example: "Algorithm: AES-256, Mode: CBC",
          },
          {
            id: "steganography",
            label: "Steganography",
            template: "Hide data in image: ",
            example: "Embedding message in cover file...",
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
              "Answer incident details:\nIncident Type: [Phishing/Malware/Breach]\nSeverity: [Low/Medium/High/Critical]\nAffected Systems: [list]\nFirst Detection Time: [timestamp]",
            example:
              "Type: Phishing\nSeverity: High\nSystems: 5 user machines\nDetection: 2024-01-24 14:30 UTC",
          },
          {
            id: "containment-checklist",
            label: "Containment Checklist",
            template:
              "Containment Steps:\n☐ Isolate affected systems\n☐ Block attacker C2 domains\n☐ Reset compromised credentials\n☐ Disable affected accounts\n☐ Document timeline",
            example:
              "☑ Isolated 5 machines from network\n☑ Blocked 3 malicious IPs\n☑ Reset 2 user passwords",
          },
          {
            id: "stakeholder-notification",
            label: "Stakeholder Notification",
            template:
              "Notify stakeholders:\nExecutive Summary: [brief description]\nImpact: [systems/users affected]\nActions Taken: [containment steps]\nNext Steps: [investigation plan]",
            example:
              "Impact: 5 users\nActions: Isolated systems, blocked domains\nNext: Forensics on Monday",
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
              "Artifacts to preserve:\n☐ Memory dumps\n☐ Log files\n☐ Network traffic (PCAP)\n☐ Disk images\n☐ Browser history\n☐ Email logs",
            example:
              "Collected:\n- 2GB memory dump\n- Full syslog (last 7 days)\n- 500MB PCAP\n- C: drive forensic image",
          },
          {
            id: "threat-actor-profile",
            label: "Threat Actor Profile",
            template:
              "Actor Analysis:\nATTACK PATTERN: [TTPs]\nTOOLS USED: [malware, exploits]\nTARGET SECTOR: [industry]\nMOTIVATION: [financial/espionage/disruption]\nKNOWN ALIASES: [other names]",
            example:
              "Pattern: Spear phishing → credential theft → lateral movement\nTools: Mimikatz, Cobalt Strike\nSector: Financial\nMotivation: Financial gain",
          },
          {
            id: "iocs-extraction",
            label: "IOCs Extraction",
            template:
              "Indicators of Compromise:\nIP ADDRESSES: []\nDOMAINS: []\nFILE HASHES: [MD5/SHA1/SHA256]\nEMAIL HEADERS: []\nURL PATTERNS: []",
            example:
              "IPs: 192.168.1.100, 10.0.0.50\nDomains: evil.com, malware.net\nHashes: d41d8cd98f00b204e9800998ecf8427e (MD5)",
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
              "Eradicate Threat:\n1. Remove malware from all systems\n2. Patch vulnerabilities\n3. Reset all credentials\n4. Update antivirus signatures\n5. Validate system integrity",
            example:
              "1. Removed Emotet from 5 machines\n2. Applied Windows patches\n3. Reset domain admin password\n4. Updated AV signatures\n5. Ran full system scans",
          },
          {
            id: "system-hardening",
            label: "System Hardening",
            template:
              "Hardening Steps:\n☐ Disable unnecessary services\n☐ Tighten firewall rules\n☐ Enable MFA\n☐ Update access controls\n☐ Enable audit logging\n☐ Deploy EDR agent",
            example:
              "☑ Disabled RDP on non-admin systems\n☑ Updated firewall rules\n☑ Enforced MFA for all users\n☑ Deployed CrowdStrike EDR",
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
              "Zero-Day Summary:\nCVE ID: []\nAFFECTED PRODUCTS: []\nSHELLCODE AVAILABLE: [Yes/No]\nWILD EXPLOITATION: [Yes/No]\nMITIGATION: []",
            example:
              "CVE-2024-12345\nMicrosoft Exchange Server\nShellcode: Available\nWild: Yes\nMitigation: Disable OWA until patch available",
          },
          {
            id: "threat-campaign",
            label: "Threat Campaign Tracking",
            template:
              "Campaign Profile:\nCAMPAIGN NAME: []\nATTRIBUTION: []\nDURATION: [dates]\nTARGET SECTORS: []\nKNOWN TTPs: []\nDETECTION METHODS: []",
            example:
              "Campaign: APT41 Financial Targeting\nAttribution: China\nDuration: Jan 2024 - present\nTargets: Banking, Insurance\nTTPs: Spear phishing, credential harvesting",
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
              "IP Analysis:\nIP ADDRESS: []\nGEO LOCATION: []\nASN: []\nPREVIOUS ACTIVITY: []\nBLACKLIST STATUS: []\nTHREAT SCORE: [1-10]",
            example:
              "IP: 192.0.2.1\nLocation: China\nASN: AS4134\nActivity: C2 Command & Control\nBlacklisted: Yes (Spamhaus)\nScore: 9/10 (Critical)",
          },
          {
            id: "domain-reputation",
            label: "Domain Reputation Check",
            template:
              "Domain Analysis:\nDOMAIN: []\nREGISTRATION DATE: []\nREGISTRAR: []\nRESOLVES TO: []\nMALWARE ASSOCIATED: []\nPHISHING HISTORY: []",
            example:
              "Domain: malware-c2.xyz\nReg Date: 2024-01-15\nRegistrar: Bulletproof Hoster\nResolves: 203.0.113.50\nMalware: Emotet, Trickbot\nPhishing: Yes (3 complaints)",
          },
          {
            id: "hash-reputation",
            label: "File Hash Reputation",
            template:
              "Hash Analysis:\nHASH (MD5): []\nHASH (SHA256): []\nFILE TYPE: []\nFIRST SEEN: []\nDETECTIONS: []\nSANDBOX VERDICT: []",
            example:
              "MD5: d41d8cd98f00b204e9800998ecf8427e\nSHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nType: .exe (Windows executable)\nFirst Seen: 2024-01-20\nDetections: 47/70 VirusTotal\nVerdict: Trojan.Win32.Agent",
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
              "MITRE Mapping:\nTACTIC: [Initial Access/Execution/Persistence/etc]\nTECHNIQUE: []\nSUB-TECHNIQUE: []\nDETECTION: [sensor/log required]\nCOUNTERMEASURE: []\nSEVERITY: [Low/Medium/High]",
            example:
              "Tactic: Initial Access\nTechnique: Phishing (T1566)\nSub: Spearphishing Email (T1566.002)\nDetection: Email gateway logs, SPF/DKIM failures\nCountermeasure: DMARC + user training\nSeverity: High",
          },
          {
            id: "ttp-analysis",
            label: "TTP Analysis",
            template:
              "TTP Breakdown:\nINITIAL ACCESS: []\nEXECUTION METHOD: []\nPERSISTENCE MECHANISM: []\nLATERAL MOVEMENT: []\nDATA EXFILTRATION: []\nLOGS TO MONITOR: []",
            example:
              "Access: Phishing\nExecution: Macro-enabled doc\nPersistence: Registry Run key\nLateral: PSExec, WMI\nExfil: HTTPS to C2\nLogs: PowerShell, Security Event Log 4688",
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
              "Header Analysis:\nFROM ADDRESS: []\nRETURN-PATH: []\nREPLY-TO: [suspicious?]\nX-MAILER: []\nMIME-VERSION: []\nAUTHENTICATION RESULTS: [SPF/DKIM/DMARC]",
            example:
              "From: support@trusted-bank.com (SPOOFED)\nReply-To: attacker@evil.com (MISMATCH!)\nSPF: FAIL (not from registered IP)\nDKIM: NONE\nDMARC: FAIL (reject policy ignored)",
          },
          {
            id: "link-analysis",
            label: "Link Analysis",
            template:
              "URL Inspection:\nDISPLAYED TEXT: []\nACTUAL HREF: []\nDOMAIN REPUTATION: []\nURL SHORTENER: [yes/no]\nREDIRECT CHAIN: []\nSANDBOX VERDICT: []",
            example:
              "Displayed: 'Click here to verify'\nActual: https://ev1l.com/phish.php?id=123\nReputation: Malicious\nShortener: bit.ly (obfuscation)\nRedirects: bit.ly → 203.0.113.50 → phishing site\nVerdict: Phishing site",
          },
          {
            id: "attachment-analysis",
            label: "Attachment Analysis",
            template:
              "File Analysis:\nFILENAME: []\nFILE TYPE: []\nSIZE: []\nEXTENSION MISMATCH: []\nEXE PACKED: [yes/no]\nVIRUSTOTAL: [detection count]",
            example:
              "File: Invoice_2024.xlsx.exe\nType: PE32 executable\nSize: 2.3 MB\nMismatch: YES! (.exe disguised as .xlsx)\nPacked: Yes (UPX)\nVT: 45/70 detections (Trojan)",
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
              "Classify Phishing:\nTYPE: [Credential harvest/Malware/Data theft/BEC]\nTARGET DEPT: [Finance/IT/HR/General]\nUMPERSONATION: [Company/Brand/Executive]\nSOPHISTICATION: [Low/Medium/High]\nLIKELY MOTIVE: [Financial/Data/Access]",
            example:
              "Type: Credential harvest\nTarget: IT Department\nImpersonation: Microsoft Office 365\nSophistication: Medium (good but has errors)\nMotive: Mass credential theft for business email compromise",
          },
          {
            id: "response-template",
            label: "Response Template",
            template:
              "Incident Response:\nIMEDIATE:\n  ☐ Remove email from circulation\n  ☐ Block sender domain\n  ☐ Notify recipients\nMEDIUM-TERM:\n  ☐ Provide training link\n  ☐ Monitor for credential use\nLONG-TERM:\n  ☐ Review email filtering rules\n  ☐ Update sender policy",
            example:
              "Removed: 234 copies from mailboxes\nBlocked: @evil.com (35 variations)\nNotified: 450 users in Marketing\nTraining: Mandatory phishing awareness module\nMonitoring: Watch for office365-phish@... credentials",
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
              "Warning Signs:\n☐ Sender domain mismatch (looks close but not exact)\n☐ Generic greeting ('Dear User' not 'Dear John')\n☐ Urgency/pressure language\n☐ Suspicious links (hover to see real URL)\n☐ Requests for password/MFA code\n☐ Attachments you weren't expecting\n☐ Unusual sender requesting unusual action\n☐ Misspellings in official branding",
            example:
              "Flag 1: From='supp0rt@bankx.com' vs real='support@bank.com' (zero vs O)\nFlag 2: 'Immediate action required to avoid account closure'\nFlag 3: Link says 'verify.bankx.com' but hovers to '203.0.113.50'\nFlag 4: Unexpected PDF 'Updated_Banking_Credentials.pdf'",
          },
          {
            id: "escalation-procedure",
            label: "Escalation Procedure",
            template:
              "If Suspicious:\n1. DO NOT click links or open attachments\n2. DO NOT provide any information\n3. DO verify sender via separate channel\n4. DO forward to security@company.com\n5. DO delete the email\n6. DO NOT feel embarrassed to report\n\nSecurity rewards reports. No punishment.",
            example:
              "User reported suspicious email at 14:05\nSecurity investigated and confirmed phishing\nUser received security reward badge and thanks\nEmail blocked company-wide in 30 minutes",
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
              "ISO 27001 Check:\nCONTROL AREA: [A.5-A.18]\nCONTROL OBJECTIVE: []\nREQUIREMENT: []\nCURRENT STATUS: [Compliant/Non-compliant/Partial]\nEVIDENCE: [documentation/logs]\nGAP REMEDIATION: []",
            example:
              "Control: A.9.2.1 User access management\nObjective: Grant appropriate access\nRequirement: Define access policies and approval process\nStatus: Partial (manual approval, no formal policy)\nEvidence: Need to document access policy\nRemediation: Draft policy within 30 days",
          },
          {
            id: "pci-dss",
            label: "PCI DSS Requirements",
            template:
              "PCI DSS Check:\nREQUIREMENT: [1-12]\nSCOPE: [In/Out of scope]\nTESTING METHOD: [Vulnerability scan/Penetration test/Interview]\nFINDINGS: [Pass/Fail/Not Applicable]\nREMEDIATION PLAN: []\nTARGET DATE: []",
            example:
              "Req 1: Firewall configuration standards\nScope: In (ASA Firewall)\nMethod: Network architecture review + config audit\nFinding: FAIL (default SNMP community strings)\nRemediation: Change SNMP v1 to v3 with auth\nTarget: 2024-02-15",
          },
          {
            id: "hipaa-compliance",
            label: "HIPAA Compliance",
            template:
              "HIPAA Check:\nSTANDARD: [Administrative/Physical/Technical]\nREQUIREMENT: []\nAPPLIES TO: [Healthcare data: yes/no]\nCURRENT CONTROL: []\nASSESS EFFECTIVENESS: []\nGAP/RISK: []",
            example:
              "Standard: Technical - Access Control\nReq: Unique user IDs and emergency access procedures\nApplies: Yes (patient data in EHR)\nControl: Active Directory login + emergency break-glass account\nEffectiveness: Adequate with logging\nGap: Emergency account access not properly logged",
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
              "Control Design:\nCONTROL OBJECTIVE: []\nINPUT/TRIGGER: []\nCONTROL ACTIVITY: []\nOUTPUT/EVIDENCE: []\nFREQUENCY: [Daily/Weekly/Monthly]\nOWNER: []\nTEST METHOD: []\nTEST RESULT: [Pass/Fail]",
            example:
              "Objective: Ensure only authorized users access databases\nTrigger: User onboarding/offboarding\nActivity: Access request approval process\nEvidence: Approval email + audit log entry\nFrequency: On-demand\nOwner: Database team\nTest: Query audit log for unauthorized access\nResult: PASS (0 unauthorized access in 30 days)",
          },
          {
            id: "evidence-collection",
            label: "Evidence Collection",
            template:
              "Gather Evidence:\nCONTROL: []\nDOCUMENTS:\n  ☐ Policy documents\n  ☐ Procedures/runbooks\n  ☐ Configuration screenshots\n  ☐ Audit logs/reports\n  ☐ Training records\n  ☐ Sign-off forms\nTEST SAMPLES: []",
            example:
              "Control: Change management\nDocuments:\n  ☑ Change policy (v2.1, signed 2023-08)\n  ☑ Change request template\n  ☑ Firewall rule change log (last 30 days)\n  ☑ Change approval emails (sample of 5)\n  ☑ Implementation screenshots\nTest: Verify 20 changes had approval before implementation",
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
              "Pre-Audit Checklist:\nFRAMEWORK: []\nIN-SCOPE SYSTEMS: [list]\nIN-SCOPE PERSONNEL: [count]\nCRITICAL GAPS: [list]\nEVIDENCE STATUS: [100%/75%/50%]\nRISK RATING: [Green/Yellow/Red]\nREMEDIATION PRIORITY: []",
            example:
              "Framework: ISO 27001\nSystems: 15 servers, 300 user accounts, 5 apps\nPersonnel: 45 IT staff\nGaps: Disaster recovery testing (never done)\nEvidence: 85% collected\nRating: Yellow (DR is high risk)\nPriority: Complete DR test before audit in March",
          },
          {
            id: "audit-schedule",
            label: "Audit Schedule & Roles",
            template:
              "Audit Planning:\nSCOPE: []\nDATES: [Start/End]\nAUDITORS: []\nKICK-OFF MEETING: [date/time]\nDATA REQUEST DEADLINE: [date]\nFACILITY TOUR: [date]\nDEBRIEF: [date]\nFINAL REPORT: [date]",
            example:
              "Scope: SOC 2 Type II (12-month period)\nDates: 2024-03-01 to 2024-03-30\nAuditors: Big4 Firm (3 auditors)\nKick-off: 2024-02-28 10 AM\nData due: 2024-02-20\nTour: 2024-03-04\nDebrief: 2024-03-28\nReport: 2024-04-15",
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
