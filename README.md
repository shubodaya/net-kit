# Net Kit (Desktop)
![Status](https://img.shields.io/badge/status-active-2ea44f)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-blue)
![Built%20With](https://img.shields.io/badge/built%20with-Tauri-24c8db)
![Frontend](https://img.shields.io/badge/frontend-React-61dafb)
![Language](https://img.shields.io/badge/language-TypeScript-3178c6)
![Security](https://img.shields.io/badge/focus-Blue%20Team-purple)
![License](https://img.shields.io/badge/license-MIT-black)


Net Kit is a Windows-first Tauri desktop app that bundles common blue-team tools with a guided assistant (Cipher). It runs fully locally except for optional Firebase auth/storage, and supports speech, templates, and quick exports.

[![Net Kit Thumbnail](https://github.com/shubodaya/net-kit/blob/master/net-thumbnail.png)](https://youtu.be/ZeOYa8j2g3k)

## 🎥 Demo Video

[Watch the Net Kit demo on YouTube](https://youtu.be/ZeOYa8j2g3k)

## What you can do (quick tour)
- **Cipher assistant & Deep Chat**: Onboarding steps, speech playback, mute/stop, and guided flows for each tool. Deep Chat hosts multiple bots (Tool Kit, Command Assist, Incident Triage, Threat Intel, Phishing Analyzer, Compliance Helper).
- **Packet capture**: Live capture via Npcap with interface picker, protocol filters, BPF filter box, start/stop/clear, save list, export as PCAP/PCAPNG, and view/delete saved captures.
- **Wi-Fi scanner**: Scan nearby SSIDs, channels, and security posture; export summary.
- **Tool Kit**: Quick utilities (URL safety, hash check, subnet calc, password strength, crypto, stego, WHOIS, report builder, etc.).
- **Command Assist**: Vendor/device guided prompts that drill down to the command you need.
- **Incident Triage**: Assessment, investigation, and recovery templates; save/load triage notes from local storage.
- **Threat Intel Summary**: Zero-day tracker, campaign tracking, reputation checks, MITRE mapping, and TTP analysis templates.
- **Phishing Analyzer**: Header/link/attachment analysis, classification, response, and user-education templates.
- **Compliance Helper**: ISO 27001, PCI DSS, HIPAA, control design/evidence, and audit prep checklists.
- **Sessions, activity, notifications**: Track runs per session, review history, and manage saved artifacts.
- **Peer chat**: Invite by handle (username#code) to chat in a cyber-punk themed channel.

## Prerequisites
- Windows 10/11 recommended (Npcap requirement for capture). Other OSes can run most tools except native capture.
- Node.js 18+ and npm.
- Rust toolchain + Cargo (for Tauri).
- Tauri CLI (`npm i -g @tauri-apps/cli`) or use the bundled devDependency.
- Npcap (https://nmap.org/npcap/) installed with admin privileges for packet capture.
- Wireshark (optional) to open exported PCAP/PCAPNG files.

## Setup

1) Install dependencies
```bash
npm install
```

2) Install capture driver (desktop only)
- Install Npcap from https://nmap.org/npcap/ (required for packet capture). Net Kit does not bundle Npcap due to licensing.

3) Provide your own backend config
- Create your env file:
  ```bash
  copy .env.example .env
  ```
- Fill in Firebase (or your own backend) keys in `.env` and ensure `firebase.config.json` is present at runtime (the app will read it locally or from Tauri on desktop). Without a backend, guest mode works but cloud features/login will not.

4) (Recommended) prepare desktop assets
```bash
npm run prepare:desktop
```

5) Run
- Desktop dev (Tauri window):
  ```bash
  npm run dev:tauri
  ```
- Build release (Windows NSIS):
  ```bash
  npm run build:tauri:win
  ```
- Web/static preview (browser-safe tools only):
  ```bash
  npx serve .
  ```

## Running
- Desktop dev (Tauri window):
```bash
npm run dev:tauri
```
- Build release (installer/binary):
```bash
npm run build:tauri:win   # Windows NSIS installer
```
- API/mock server only (if you need it):
```bash
npm run dev
```

## Tool behavior (brief)
- **Cipher widget**: Bottom-right launcher. Auto-popup can be toggled; speech can be muted or stopped. "Speak" introduces itself then reads the current step list.
- **Deep Chat / Runbook**: Select a bot across the top. Each selection injects a template into the input; you respond by choosing options. Speech controls sit in the header.
- **Packet capture**: Pick an interface (Realtek/Ethernet/Wi-Fi sorted to the top), choose protocols or BPF, click Start/Stop. Saved captures appear in the Saved modal where you can check/uncheck and delete. Export via dropdown to PCAP or PCAPNG.
- **Wi-Fi**: Scan, view channels/security, export summary (no auto-refresh).
- **Tool Kit utilities**: URL check, hash, subnet, password, crypto/stego, WHOIS, report builder, etc. Use "Save" to store outputs to the current session.
- **Command Assist**: Pick vendor ? model/device ? command family to auto-suggest commands.
- **Incident Triage**: Templates for Initial Assessment, Containment, Stakeholder Notifications, Artifact Collection, Threat Actor Profile, IOC Extraction, Eradication Plan, and System Hardening. Notes can be saved/loaded locally.
- **Threat Intel**: Templates for zero-days, campaigns, IP/domain/hash reputation, MITRE mapping, and TTP analysis.
- **Phishing Analyzer**: Header/link/attachment analysis, classification, response playbook, and user-education flags.
- **Compliance Helper**: ISO 27001, PCI DSS, HIPAA checks; control design/testing; evidence collection; audit readiness and scheduling.
- **Peer chat**: Share your handle (username#code). Invites/accepts show in the notification panel.

## Data & storage
- User sessions, notifications, and saved notes/captures are stored locally in `localStorage` (and in app data for Tauri). Firebase auth is optional; guest mode is limited.
- Keep secrets in `.env`; do not commit it. `.env.example` lists all required keys.

## Building for distribution (local)
- Windows installer (NSIS): `npm run build:tauri:win`. Output: `src-tauri/target/release/bundle/nsis/`.
- `npm run build:tauri` also works for Windows; specify `--bundles nsis` if you need only NSIS.
- For Linux/macOS bundles, build on those OSes or let CI handle it.
- Optional: set `RUST_PROFILE=release` in `.env` for tighter binaries.

## CI builds for all platforms (GitHub Actions)
- A matrix workflow (`.github/workflows/tauri-matrix.yml`) runs on tag pushes (`v*`).
- It produces Windows (nsis), Ubuntu (deb/appimage/rpm), and macOS (dmg) artifacts.
- Download artifacts from the Actions run:
  - Windows: `tauri-windows-latest`
  - Linux: `tauri-ubuntu-latest`
  - macOS: `tauri-macos-latest`
- Add a GitHub Release later to auto-attach these artifacts if desired.

## Legal & required dependencies
- **Npcap** is required for packet capture. License forbids bundling/redistribution without an OEM license. Users must download/install it themselves from https://nmap.org/npcap/ (or via Wireshark/Nmap). Net Kit does not ship Npcap.
- Without Npcap, other tools still work; packet capture will be unavailable.

## Troubleshooting
- Packet capture shows no interfaces: run as Administrator, confirm Npcap installed, click Refresh Interfaces, or run `tshark -D` to verify visibility.
- Wireshark cannot open exported files: ensure you chose PCAP or PCAPNG via the Export dropdown.
- Speech not playing: confirm system TTS voices are available; check the mute button state.
- Firebase login issues: re-check `.env` Firebase keys and network reachability.

## Repository hygiene
- Do not commit `.env` or other secrets.
- Large installers/SDKs (Npcap, Wireshark) are present locally for convenience; exclude them from commits if not needed.

## Contribute
- Open issues and PRs at https://github.com/shubodaya/net-kit.
- Good first contributions: new tool templates, command packs, UX tweaks for capture/scan, and documentation improvements.
- Keep PRs small; include a brief test note (even “manual QA: npm run dev:tauri”).

---
Net Kit is open source—download, test, suggest improvements, and help expand the tool set.


