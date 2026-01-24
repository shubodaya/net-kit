# Quick Start: Deep Chat Tools Guide

## 5 Security Tools Now Available

### 1. 🛠️ Tool Kit
**Purpose**: Explore and understand security tools
**Categories**:
- **Networking Tools**: IP subnet calculator, IP scanner, port scanner, WHOIS lookup, Wi-Fi scanner
- **Analysis Tools**: File hash checker, URL safety checker, log analyzer, speed test
- **Security Tools**: Password strength checker, cryptography tools, steganography

**How to Use**:
1. Click "Tool Kit" button in Deep Chat
2. Select a category
3. Choose a tool
4. Template auto-filled in input
5. Fill in your data and submit

---

### 2. 🚨 Incident Triage
**Purpose**: Structured incident response workflow
**Categories**:
- **Assessment**: Initial assessment, containment checklist, stakeholder notification
- **Investigation**: Artifact collection, threat actor profiling, IOCs extraction
- **Recovery**: Eradication plan, system hardening

**When to Use**: When responding to security incidents
**Output**: Organized incident response checklist and templates

---

### 3. 🔍 Threat Intel Summary
**Purpose**: Track and analyze threat intelligence
**Categories**:
- **Latest Threats**: Zero-day tracker, threat campaign tracking
- **Indicators & Reputation**: IP reputation check, domain reputation, file hash reputation
- **Research & Analysis**: MITRE ATT&CK mapping, TTP analysis

**When to Use**: Analyzing threat actors, checking malware indicators, understanding attack patterns

---

### 4. 🎣 Phishing Analyzer
**Purpose**: Analyze and classify phishing emails
**Categories**:
- **Email Analysis**: Header inspection, link analysis, attachment analysis
- **Classification & Triage**: Phishing type classification, response templates
- **User Education**: Red flags to teach, escalation procedures

**When to Use**: When investigating suspicious emails or training users

---

### 5. ✓ Compliance Helper
**Purpose**: Track compliance requirements and controls
**Categories**:
- **Frameworks**: ISO 27001 controls, PCI DSS requirements, HIPAA compliance
- **Control Implementation**: Control design & testing, evidence collection
- **Audit Preparation**: Audit readiness assessment, audit scheduling

**When to Use**: Preparing for audits, tracking compliance status, implementing controls

---

## 🔊 Mute Button

**Location**: Top-right header, next to notifications

**Icons**:
- 🔊 (speaker) = TTS enabled
- 🔇 (muted speaker) = TTS disabled

**How to Use**:
1. Click the button once to mute all text-to-speech
2. Click again to unmute

**When Muted**: All tool speech output is silent, but text templates still display

---

## 💡 Tips

### Template Prefilling
When you select an option, the prompt automatically fills with a template. You just need to:
1. Add your specific data
2. Answer any bracketed questions [like this]
3. Submit

Example:
```
Template: "Scan ports on host: "
You type: "Scan ports on host: 192.168.1.1"
```

### Using Categories
Most tools have 2-3 levels:
1. **Category** (e.g., "Assessment")
2. **Option** (e.g., "Initial Assessment")
3. **Template** (automatically filled)

### Going Back
- Click "← Back to Categories" to return to tool selection
- Click "✕ Close" to exit the tool

---

## 🎯 Common Workflows

### Incident Response Workflow
1. Incident Triage → Assessment → Initial Assessment
2. Review the template and fill in incident details
3. Submit to Cipher for guided analysis
4. Return to Incident Triage → Investigation → Artifact Collection
5. Document findings

### Phishing Email Investigation
1. Phishing Analyzer → Email Analysis → Header Inspection
2. Copy suspicious email headers and paste
3. Get analysis and warnings
4. Phishing Analyzer → Classification → Phishing Type Classification
5. Document findings for security team

### Compliance Audit Prep
1. Compliance Helper → Frameworks → ISO 27001 Controls
2. Select control category
3. Review requirements
4. Compliance Helper → Control Implementation → Evidence Collection
5. Document what evidence you need to gather

### Threat Research
1. Threat Intel Summary → Latest Threats → Zero-Day Tracker
2. Enter CVE ID or threat name
3. Get briefing on threat landscape
4. Threat Intel Summary → Indicators → IP/Domain Reputation
5. Check indicators of compromise

---

## 📋 Template Examples

### Password Strength Checker
**Template**: `Check password strength: `
**Example**: `Check password strength: MyP@ssw0rd!SecureAF`

### IP Subnet Calculator
**Template**: `Calculate subnet for network: `
**Example**: `Calculate subnet for network: 192.168.0.0/24`

### Incident Assessment
**Template**:
```
Answer incident details:
Incident Type: [Phishing/Malware/Breach]
Severity: [Low/Medium/High/Critical]
Affected Systems: [list]
First Detection Time: [timestamp]
```

### Email Header Inspection
**Template**:
```
Header Analysis:
FROM ADDRESS: []
RETURN-PATH: []
REPLY-TO: [suspicious?]
AUTHENTICATION RESULTS: [SPF/DKIM/DMARC]
```

---

## ⚙️ Keyboard Shortcuts

- **Tab**: Navigate between options
- **Enter**: Select highlighted option
- **Arrow Keys**: Move between options in grid
- **Escape**: Close tool panel

---

## 🐛 Troubleshooting

### Tool Options Not Showing?
- Refresh the page
- Ensure JavaScript is enabled
- Check browser console for errors

### Templates Not Prefilling?
- Verify the text input (#cipherAiInput) is visible
- Clear your browser cache

### Mute Button Not Working?
- Refresh the page
- Check if another tab is playing audio
- Verify browser volume is not muted

### No Sound Output?
1. Check mute button (should show 🔊 not 🔇)
2. Verify system volume is on
3. Check browser speaker/audio settings

---

## 📞 Support

For issues or feature requests:
1. Document your workflow
2. Check browser console for errors
3. Share steps to reproduce the issue

---

## Version Info
**Deep Chat Tools Integration v1.0**
- Release Date: 2024
- Tools: 5 (Toolkit, Incident Triage, Threat Intel, Phishing, Compliance)
- Total Templates: 60+
- Status: Production Ready
