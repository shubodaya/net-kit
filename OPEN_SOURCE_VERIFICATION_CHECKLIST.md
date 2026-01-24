# Cyber Kit - Open Source Release Verification Checklist

Complete this checklist before publishing Cyber Kit as an open-source project.

---

## ✅ Part 1: Icon Setup & Branding

### Icon Files Present
- [ ] `src-tauri/icons/icon.ico` exists (Windows multi-resolution icon)
- [ ] `src-tauri/icons/icon.icns` exists (macOS icon bundle)
- [ ] `src-tauri/icons/32x32.png` exists (Linux small icon)
- [ ] `src-tauri/icons/128x128.png` exists (Linux medium icon)
- [ ] `src-tauri/icons/128x128@2x.png` exists (Linux Retina icon)
- [ ] `src-tauri/icons/icon.png` exists (General-purpose PNG)
- [ ] All `Square*.png` files exist (Windows UWP tiles)
- [ ] All `StoreLogo.png` exists (Windows Store)

### Icon Validation
```powershell
cd src-tauri/icons

# Check Windows ICO
file icon.ico        # Should show: "MS Windows icon resource"
ls -la icon.ico      # Should be 30-100 KB

# Check macOS ICNS
file icon.icns       # Should show: "Apple Icon"
ls -la icon.icns     # Should be 100-300 KB

# Check PNG files
file 32x32.png       # Should show: "PNG image data"
ls -la 32x32.png     # Should be 1-5 KB
```

**Verification**: ✅ All icon files present and valid

---

## ✅ Part 2: Configuration Files

### Tauri Configuration
- [ ] `src-tauri/tauri.conf.json` exists
- [ ] `identifier` is set to `com.cyberkit.desktop` (not com.tauri.dev)
- [ ] `productName` is "Cyber Kit"
- [ ] `version` matches current release (e.g., "0.1.0")
- [ ] `icon` array references all icon files correctly
- [ ] Bundle targets include "all" platforms

**Verification Command**:
```bash
cd src-tauri
cat tauri.conf.json | grep -E "(identifier|productName|version|targets)"
```

Expected output:
```
"productName": "Cyber Kit",
"version": "0.1.0",
"identifier": "com.cyberkit.desktop",
"targets": "all",
```

### Environment Configuration
- [ ] `.env.example` exists with all configuration options
- [ ] `.env` file is in `.gitignore`
- [ ] No `.env` file in repository (check: `git ls-files | grep -i .env`)
- [ ] Comments explain each configuration variable

**Verification**: `cat .env.example | wc -l` should show 50+ lines

---

## ✅ Part 3: Open Source Documentation

### License & Community
- [ ] `LICENSE` file exists (MIT License)
- [ ] `CONTRIBUTING.md` exists with clear guidelines
- [ ] `CODE_OF_CONDUCT.md` exists (Contributor Covenant)
- [ ] `.github/ISSUE_TEMPLATE/bug_report.md` exists
- [ ] `.github/ISSUE_TEMPLATE/feature_request.md` exists
- [ ] `.github/pull_request_template.md` exists

**Verification**:
```bash
ls -la LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md
ls -la .github/ISSUE_TEMPLATE/*.md
ls -la .github/pull_request_template.md
```

All should return files (no "not found" errors).

### README Quality
- [ ] `README.md` exists (extensive, professional)
- [ ] Includes "What is Cyber Kit?" section
- [ ] Lists all features and tools
- [ ] Includes platform support table
- [ ] Has tech stack section
- [ ] Contains quick start installation steps
- [ ] Documents local development setup
- [ ] Explains build process for each platform
- [ ] Includes testing and code quality sections
- [ ] Has security vulnerability reporting info
- [ ] Contains acknowledgments and roadmap

**Verification**: `cat README.md | wc -l` should show 300+ lines

---

## ✅ Part 4: Git Repository & Secrets

### Repository Cleanliness
- [ ] Run `git status` - shows "nothing to commit, working tree clean"
- [ ] Run `git log --oneline | head -10` - has meaningful commit history
- [ ] No `.env` file tracked: `git ls-files | grep .env` should be empty
- [ ] No private keys tracked: `git ls-files | grep -i key` should be empty
- [ ] No credentials in code: `git grep -i "password\|api_key\|secret" | grep -v example`

### .gitignore Completeness
- [ ] `node_modules/` excluded
- [ ] `src-tauri/target/` excluded
- [ ] `.env` and `.env.*.local` excluded
- [ ] `.vscode/` and `.idea/` excluded
- [ ] `.DS_Store` and OS files excluded
- [ ] `*.log`, `npm-debug.log*` excluded
- [ ] Build output directories excluded

**Verification**:
```bash
grep -E "node_modules|src-tauri/target|\.env|\.vscode" .gitignore
# Should return matches for all

git check-ignore node_modules/ .env
# Should return paths (meaning they're properly ignored)
```

---

## ✅ Part 5: GitHub Actions & CI/CD

### Workflow File
- [ ] `.github/workflows/build-release.yml` exists
- [ ] Triggers on push of git tags (`v*`)
- [ ] Has separate jobs for Windows, macOS, Linux
- [ ] Windows job uses `windows-latest`
- [ ] macOS job builds both x86_64 and aarch64
- [ ] Linux job installs system dependencies
- [ ] Upload artifacts step included
- [ ] Create release step included

**Verification**:
```bash
cat .github/workflows/build-release.yml | grep -E "build-windows|build-macos|build-linux|build-release"
```

Should show all job names.

### Workflow Test
- [ ] Workflow syntax is valid: `github-actions-validator validate .github/workflows/build-release.yml` (or review manually)
- [ ] All required environment variables documented
- [ ] No hardcoded secrets in workflow
- [ ] Uses `${{ secrets.GITHUB_TOKEN }}` for releases

---

## ✅ Part 6: Dependencies & Build

### Node.js Dependencies
- [ ] `package.json` exists with proper metadata
- [ ] `package-lock.json` or `yarn.lock` is committed
- [ ] Run `npm ci` successfully: `npm ci > /dev/null 2>&1 && echo "✓ Dependencies OK"`
- [ ] No high-severity vulnerabilities: `npm audit` shows 0 vulnerabilities or all optional

### Rust Dependencies
- [ ] `src-tauri/Cargo.toml` exists
- [ ] All dependencies are from crates.io (no git dependencies problematic)
- [ ] `Cargo.lock` is committed (reproducible builds)
- [ ] Rust toolchain specified: check `.rust-version` or rustup override

**Verification**:
```bash
cd src-tauri
cargo check > /dev/null 2>&1
echo "Rust dependencies: $?"  # Should print 0
```

### Build Prerequisites
- [ ] Rust installed: `rustc --version` (should be 1.70+)
- [ ] Node.js 18+: `node --version`
- [ ] npm: `npm --version`
- [ ] Platform-specific tools documented in README

---

## ✅ Part 7: Multi-Platform Build Test

### Windows Build (on Windows machine)
```powershell
# Prerequisites
rustup target add x86_64-pc-windows-msvc

# Build
npm run build:tauri

# Verify output
Test-Path "src-tauri\target\release\bundle\msi"
Get-ChildItem "src-tauri\target\release\bundle\msi\*.msi"
```

Expected output: `Cyber-Kit_0.1.0_x64_en-US.msi` (~100-150 MB)

**Checklist**:
- [ ] Build completes without errors
- [ ] MSI file generated
- [ ] File size is reasonable (50-200 MB)
- [ ] File is executable

### macOS Build (on macOS machine)
```bash
# Prerequisites
rustup target add x86_64-apple-darwin aarch64-apple-darwin

# Build (builds for current architecture)
npm run build:tauri

# Verify output
ls -la src-tauri/target/release/bundle/macos/
```

Expected: `Cyber Kit.app` directory

**Checklist**:
- [ ] Build completes without errors
- [ ] .app bundle generated
- [ ] App can be opened
- [ ] Icon appears in Finder
- [ ] App shows in Dock

### Linux Build (on Ubuntu/Debian)
```bash
# Install system dependencies (already in README)
sudo apt-get install -y libgtk-3-dev libssl-dev libappindicator3-dev librsvg2-dev patchelf

# Prerequisites
rustup target add x86_64-unknown-linux-gnu

# Build
npm run build:tauri

# Verify output
ls -la src-tauri/target/release/bundle/appimage/
ls -la src-tauri/target/release/bundle/deb/
```

Expected: `.AppImage` and `.deb` files

**Checklist**:
- [ ] Build completes without errors
- [ ] AppImage file generated and executable
- [ ] .deb package generated
- [ ] Both installers are reasonable size

---

## ✅ Part 8: Icon Display Verification

### Windows Icon Display
1. Build: `npm run build:tauri` (on Windows)
2. Locate: `src-tauri/target/release/bundle/msi/Cyber-Kit_*.msi`
3. Right-click `.msi` → Properties
   - [ ] Icon displays in Properties dialog
   - [ ] Icon matches CK branding
4. Double-click to install
5. After installation, check:
   - [ ] App appears in Start Menu with icon
   - [ ] Desktop shortcut has icon
   - [ ] Running app shows icon in taskbar
   - [ ] Control Panel → Programs shows icon

### macOS Icon Display
1. Build: `npm run build:tauri` (on macOS)
2. Navigate: `src-tauri/target/release/bundle/macos/`
3. Right-click `Cyber Kit.app` → Get Info
   - [ ] Icon displays in top-left corner
   - [ ] Icon matches CK branding
4. Drag app to Dock
   - [ ] Icon appears in Dock
   - [ ] Icon matches desktop version
5. In Finder, locate app
   - [ ] Icon displays in list view
   - [ ] Icon displays in icon view

### Linux Icon Display
1. Build: `npm run build:tauri` (on Linux)
2. Install: `sudo apt install ./cyber-kit_*.deb`
3. Check application menu/launcher:
   - [ ] Icon appears next to application name
   - [ ] Icon matches CK branding
4. Run: `./cyber-kit_*.AppImage`
   - [ ] Icon may appear in taskbar
   - [ ] Window shows icon in title bar

---

## ✅ Part 9: GitHub Release Preparation

### Release Information
- [ ] Version number ready (e.g., v0.1.0)
- [ ] `CHANGELOG.md` updated with release notes
- [ ] Release notes describe new features/fixes
- [ ] GitHub release description prepared
- [ ] Installation instructions updated

### Tag & Push Steps
```bash
# Update version in files
# 1. package.json: "version": "0.1.0"
# 2. src-tauri/tauri.conf.json: "version": "0.1.0"
# 3. CHANGELOG.md: ## [0.1.0] - 2024-01-24

# Commit
git add .
git commit -m "chore: Prepare v0.1.0 release"

# Tag (this triggers CI/CD builds)
git tag -a v0.1.0 -m "Release version 0.1.0"

# Push (triggers GitHub Actions)
git push origin main
git push origin v0.1.0

# Verify GitHub Actions started
# Check: https://github.com/shubodaya/cyber-kit/actions
```

**Verification**:
- [ ] GitHub Actions workflow triggered
- [ ] Windows build started
- [ ] macOS build started
- [ ] Linux build started
- [ ] Builds complete successfully
- [ ] GitHub Release created automatically
- [ ] All installers available for download

---

## ✅ Part 10: Repository Readiness

### Essential Files Checklist
```bash
# All should exist
test -f LICENSE && echo "✓ LICENSE"
test -f README.md && echo "✓ README.md"
test -f CONTRIBUTING.md && echo "✓ CONTRIBUTING.md"
test -f CODE_OF_CONDUCT.md && echo "✓ CODE_OF_CONDUCT.md"
test -f .env.example && echo "✓ .env.example"
test -f .github/workflows/build-release.yml && echo "✓ Workflow"
test -f .gitignore && echo "✓ .gitignore"
test -f package.json && echo "✓ package.json"
test -f src-tauri/tauri.conf.json && echo "✓ tauri.conf.json"
```

All should output `✓` (checkmark).

### GitHub Repository Settings
1. Go to repository Settings → General
   - [ ] Repository description updated
   - [ ] Homepage URL set (if you have one)
   - [ ] Topics added: `security`, `cybersecurity`, `toolkit`, `tauri`, `desktop-app`, `rust`

2. Settings → Features
   - [ ] Issues enabled
   - [ ] Discussions enabled (optional, for community)
   - [ ] Wiki disabled (unless needed)
   - [ ] Projects enabled (optional)

3. Settings → Manage access
   - [ ] Collaborators invited (if applicable)
   - [ ] Branch protection rules created (optional, for production repos)

---

## 📋 Pre-Launch Checklist Summary

Run this script to verify everything:

```bash
#!/bin/bash

echo "🔍 Cyber Kit Open Source Readiness Check"
echo "========================================"
echo

# Icons
echo "📦 Icon Files:"
[ -f src-tauri/icons/icon.ico ] && echo "  ✓ icon.ico" || echo "  ✗ icon.ico MISSING"
[ -f src-tauri/icons/icon.icns ] && echo "  ✓ icon.icns" || echo "  ✗ icon.icns MISSING"
[ -f src-tauri/icons/32x32.png ] && echo "  ✓ 32x32.png" || echo "  ✗ 32x32.png MISSING"

# Documentation
echo
echo "📄 Documentation:"
[ -f LICENSE ] && echo "  ✓ LICENSE" || echo "  ✗ LICENSE MISSING"
[ -f README.md ] && echo "  ✓ README.md" || echo "  ✗ README.md MISSING"
[ -f CONTRIBUTING.md ] && echo "  ✓ CONTRIBUTING.md" || echo "  ✗ CONTRIBUTING.md MISSING"
[ -f CODE_OF_CONDUCT.md ] && echo "  ✓ CODE_OF_CONDUCT.md" || echo "  ✗ CODE_OF_CONDUCT.md MISSING"

# Git
echo
echo "🔒 Git & Secrets:"
[ $(git ls-files | grep -c ".env") -eq 0 ] && echo "  ✓ No .env files committed" || echo "  ✗ .env files found in git"
[ $(git grep -l "password\|api_key\|secret" 2>/dev/null | wc -l) -eq 0 ] && echo "  ✓ No secrets in code" || echo "  ⚠️  Possible secrets found"

# Build
echo
echo "🔨 Build Files:"
[ -f package.json ] && echo "  ✓ package.json" || echo "  ✗ package.json MISSING"
[ -f src-tauri/tauri.conf.json ] && echo "  ✓ tauri.conf.json" || echo "  ✗ tauri.conf.json MISSING"

# Workflows
echo
echo "⚙️  CI/CD:"
[ -f .github/workflows/build-release.yml ] && echo "  ✓ GitHub Actions workflow" || echo "  ✗ Workflow MISSING"

echo
echo "========================================"
echo "✅ If all checks pass, you're ready!"
```

---

## 🚀 Final Steps Before Launch

1. **Create GitHub release**: Push tag `v0.1.0`
2. **Test installers**: Download from GitHub Release and test on each platform
3. **Verify installation**: Each installer should:
   - Install without errors
   - Create application shortcut/menu entry
   - Display correct icon
   - Run application successfully
4. **Write release notes**: Include changelog, installation instructions, acknowledgments
5. **Announce**: Share on security forums, Twitter, Reddit, etc.

---

## ✨ Congratulations!

Your Cyber Kit repository is now ready for open source! 🎉

**Next steps**:
- Monitor issue submissions
- Review pull requests
- Engage with community
- Plan v0.2.0 features
- Maintain regular releases

---

**Need help?** Check [CONTRIBUTING.md](CONTRIBUTING.md) or open a discussion on GitHub.
