# Cyber Kit

> **A comprehensive cybersecurity toolkit desktop application for reconnaissance, compliance analysis, and intelligence gathering.**

![Cyber Kit - Desktop Application](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Version](https://img.shields.io/badge/Version-0.1.0-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Build Status](https://img.shields.io/github/actions/workflow/status/shubodaya/cyber-kit/build-release.yml)

## 🎯 What is Cyber Kit?

Cyber Kit is a modern, cross-platform desktop application that brings together essential cybersecurity tools in one integrated environment. It's designed for security professionals, network administrators, and penetration testers who need quick access to multiple reconnaissance and analysis tools without context-switching between applications.

### Who is it for?

- **Security Professionals**: Penetration testers, security auditors, red teamers
- **Network Administrators**: Network troubleshooting, configuration management
- **System Administrators**: System analysis, compliance checking
- **Security Researchers**: Data collection, intelligence gathering
- **Developers**: Building and testing security implementations

## ✨ Features

### Current Tools

- **🔍 Command Assist**
  - Intelligent command generation and documentation
  - Cross-platform command examples
  - Command syntax assistance and learning

- **🔐 Compliance Bot**
  - Security compliance checking and verification
  - Standards compliance (PCI-DSS, HIPAA, CIS, SOC2)
  - Audit trail generation

- **🕵️ Intelligence Bot**
  - OSINT (Open Source Intelligence) gathering
  - Domain reconnaissance
  - Threat intelligence integration

- **⚠️ Phishing Bot**
  - Phishing indicator detection
  - Email analysis tools
  - URL safety checking

- **🚨 Triage Bot**
  - Incident triage and classification
  - Priority assessment
  - Initial response guidance

- **🌐 Web Tools**
  - DNS lookup and analysis
  - Port scanning utilities
  - HTTP header inspection
  - SSL certificate analysis

- **📡 WiFi Analysis**
  - Network discovery
  - WiFi security assessment
  - Network troubleshooting

### Platform Support

| Platform | Support | Installer | Architecture |
|----------|---------|-----------|--------------|
| Windows | ✅ Full | .msi | x64 |
| macOS | ✅ Full | .dmg | Intel, Apple Silicon (M1/M2/M3) |
| Linux | ✅ Full | .AppImage, .deb | x64 |

## 📋 Tech Stack

### Frontend
- **HTML5 / CSS3 / JavaScript (ES6+)**
- **Modern, responsive UI components**
- **Dark theme optimized for security professionals**

### Backend
- **Node.js** - Application backend
- **Express.js** - HTTP API server
- **Python** - WiFi scanning and network utilities

### Desktop Framework
- **Tauri** - Lightweight, secure desktop framework
- **Rust** - High-performance, memory-safe core
- **WebView2** (Windows), **WebKit** (macOS/Linux)

### Build & Distribution
- **npm/Node Package Manager** - JavaScript dependencies
- **Cargo/Rust Toolchain** - Rust compilation
- **GitHub Actions** - Automated builds and releases

## 🚀 Quick Start

### Prerequisites

- **Windows / macOS / Linux** operating system
- **4GB RAM** minimum (8GB recommended)
- **.NET Framework 6.0+** (Windows only, auto-installed)
- No administrator privileges required for standard operation

### Installation

#### Windows
1. Download `Cyber-Kit_*.msi` from [Releases](https://github.com/shubodaya/cyber-kit/releases)
2. Double-click the installer
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

#### macOS
1. Download `Cyber Kit_*.dmg` from [Releases](https://github.com/shubodaya/cyber-kit/releases)
2. Double-click to open the disk image
3. Drag "Cyber Kit" to Applications folder
4. Launch from Applications (Cmd+Space → "Cyber Kit")

#### Linux (Ubuntu/Debian)
```bash
# Option 1: Using .deb package
sudo apt install ./cyber-kit_*.deb

# Option 2: Using AppImage
chmod +x cyber-kit_*.AppImage
./cyber-kit_*.AppImage
```

### First Run

1. Launch the application
2. You'll see the main interface with tool categories on the left
3. Select a tool to view available options
4. Use the **Command Assist** tool to learn command syntax
5. Refer to individual tool documentation within the app

## 💻 Local Development

### Prerequisites

- **Node.js** 18+ (https://nodejs.org)
- **Rust** (https://rustup.rs)
- **Git** (https://git-scm.com)
- Text editor or IDE (VS Code recommended)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/shubodaya/cyber-kit.git
   cd cyber-kit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   - App opens at http://localhost:3000
   - Hot reload enabled for changes
   - Backend API available at http://localhost:3001

4. **Build for desktop development** (optional)
   ```bash
   npm run dev:tauri
   ```
   - Starts app in Tauri window
   - Easier for testing desktop-specific features

### Project Structure

```
cyber-kit/
├── index.html              # Main HTML entry point
├── app.js                  # Frontend JavaScript
├── styles.css              # Application styles
├── package.json            # Node.js dependencies & scripts
│
├── components/             # UI components
│   ├── command_assist_panel.js
│   ├── options_panel.js
│   ├── ui_components.js
│   └── ...
│
├── data/                   # Data definitions
│   ├── tool_registry.js    # Tool configurations
│   ├── tool_options.js     # Tool options/parameters
│   └── ...
│
├── server/                 # Backend APIs
│   ├── server.js           # Express server
│   ├── bot_*.js            # Tool implementations
│   ├── command_assist.js   # Command generation
│   └── wifi_*.py           # WiFi utilities
│
├── scripts/                # Build scripts
│   └── prepare-desktop.mjs # Tauri build preparation
│
└── src-tauri/              # Tauri configuration & Rust code
    ├── tauri.conf.json     # Tauri configuration
    ├── src/
    │   ├── main.rs
    │   └── lib.rs
    ├── icons/              # Application icons
    └── target/             # Build output (ignored in git)
```

## 🏗️ Building for Release

### Build Locally (All Platforms)

```bash
# Build production release
npm run build:tauri
```

Output location:
```
src-tauri/target/release/bundle/
├── msi/          # Windows installer
├── macos/        # macOS app bundle
├── appimage/     # Linux AppImage
└── deb/          # Linux Debian package
```

### Platform-Specific Builds

#### Windows (on Windows)
```bash
npm run build:tauri
# Outputs: .msi installer
```

#### macOS (on macOS)
```bash
npm run build:tauri
# Outputs: .dmg installer (Intel)
# Outputs: .dmg installer (Apple Silicon) - when building on M1/M2/M3
```

#### Linux (on Linux/Ubuntu)
```bash
npm run build:tauri
# Outputs: .AppImage executable
# Outputs: .deb package
```

### Cross-Platform CI/CD Builds

Automated builds happen on GitHub Actions when you push a git tag:

```bash
# Update version numbers
# Edit package.json: "version": "0.2.0"
# Edit src-tauri/tauri.conf.json: "version": "0.2.0"
# Edit CHANGELOG.md

# Commit and tag
git add .
git commit -m "chore: Prepare v0.2.0 release"
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main
git push origin v0.2.0

# GitHub Actions automatically:
# - Builds Windows .msi on windows-latest
# - Builds macOS .dmg on macos-latest (Intel & Apple Silicon)
# - Builds Linux .AppImage & .deb on ubuntu-latest
# - Creates GitHub Release with all installers
```

## 🧪 Testing

### Running Tests

```bash
# Run all JavaScript tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- tests/components.test.js

# Run Rust tests
cd src-tauri
cargo test
```

### Code Quality

```bash
# Check code style (JavaScript)
npm run lint

# Fix style issues automatically
npm run lint:fix

# Rust linting
cd src-tauri
cargo clippy

# Rust formatting
cargo fmt
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

See [.env.example](.env.example) for all available options.

### Tauri Configuration

Edit `src-tauri/tauri.conf.json` to customize:
- App window size and behavior
- Bundle settings and signing
- Platform-specific configurations

See [ICON_SETUP_GUIDE.md](ICON_SETUP_GUIDE.md) for icon configuration.

## 📚 Documentation

- **[Icon Setup Guide](ICON_SETUP_GUIDE.md)** - Application icon setup for all platforms
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines
- **[Changelog](CHANGELOG.md)** - Version history and changes
- **[Architecture Documentation](docs/ARCHITECTURE.md)** - Technical architecture details

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup instructions
- Branch naming conventions
- Commit message guidelines
- Code style requirements
- Pull request process
- Issue reporting

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and commit: `git commit -m "feat: Add new feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## 🐛 Reporting Issues

Found a bug? Please [open an issue](https://github.com/shubodaya/cyber-kit/issues/new?template=bug_report.md) with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your system information
- Screenshots/logs if applicable

## 💡 Feature Requests

Have an idea? [Submit a feature request](https://github.com/shubodaya/cyber-kit/issues/new?template=feature_request.md) with:

- Clear description of the feature
- Why you need it
- Use cases and benefits

## 📄 License

Cyber Kit is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

This means you can:
- ✅ Use it commercially
- ✅ Modify the code
- ✅ Distribute copies
- ✅ Use it privately

You must:
- 📋 Include the license and copyright notice

## 🛡️ Security

### Reporting Security Issues

If you discover a security vulnerability, please **do NOT** open a public issue. Instead:

1. Email security details to the maintainers (check GitHub profile)
2. Include steps to reproduce if possible
3. Allow time for a fix before disclosure

## 🙏 Acknowledgments

- Tauri framework team for the lightweight desktop framework
- Rust community for safety and performance
- Node.js ecosystem for development tools
- Open source community contributors

## 📞 Support

- **Questions?** Check [Discussions](https://github.com/shubodaya/cyber-kit/discussions)
- **Found a bug?** Open an [Issue](https://github.com/shubodaya/cyber-kit/issues)
- **Want to contribute?** See [Contributing](CONTRIBUTING.md)

## 🔄 Roadmap

### Planned Features (v0.2.0+)
- [ ] Plugin system for custom tools
- [ ] Cloud sync for configurations
- [ ] Extended OSINT integrations
- [ ] Team collaboration features
- [ ] Custom report generation
- [ ] API server mode

### Long-term Vision
- Become the go-to security toolkit for professionals
- Support for community-developed plugins
- Enterprise licensing options
- Mobile companion app

---

**Made with ❤️ by the Cyber Kit community**

[GitHub](https://github.com/shubodaya/cyber-kit) • [Releases](https://github.com/shubodaya/cyber-kit/releases) • [Issues](https://github.com/shubodaya/cyber-kit/issues) • [Discussions](https://github.com/shubodaya/cyber-kit/discussions)
