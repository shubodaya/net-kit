# Tauri Project Optimization & Release Guide

## 1. Folders Safe to Delete Before Distribution

### 🗑️ High Priority - Delete Before Publishing

#### Root Directory
| Folder | Size Impact | Safe to Delete | Reason |
|--------|-------------|---|---|
| **node_modules/** | 100-300 MB | ✅ YES | Dependencies, regenerated via `npm install` |
| **src-tauri/target/** | 500-2000 MB | ✅ YES | Rust build artifacts, regenerated via `cargo build` |
| **dist/** (if exists) | 5-50 MB | ✅ YES | Built web assets, regenerated via build script |
| **desktop-dist/** (if exists) | 5-50 MB | ✅ YES | Desktop-specific build, regenerated automatically |
| **.next/** (if exists) | 50-200 MB | ✅ YES | Next.js build cache |
| **build/** (if exists) | 50-200 MB | ✅ YES | Build artifacts |

#### Node Package Artifacts
| File | Safe to Delete | Reason |
|------|---|---|
| **package-lock.json** | ⚠️ KEEP | Lock file for reproducible builds |
| **Cargo.lock** | ⚠️ KEEP | Lock file for Rust dependency versions |

### 📋 Medium Priority - Documentation Cleanup (Optional)

These are safe to delete if distribution size is critical:

| File | Size | Safe to Delete | Keep For |
|------|------|---|---|
| **CHANGED_FILES.md** | <1 MB | ✅ YES | Development only |
| **CHANGES_SUMMARY.md** | <1 MB | ✅ YES | Development only |
| **COMPLETION_STATUS.md** | <1 MB | ✅ YES | Development only |
| **COMMAND_ASSIST_*.md** | <5 MB | ✅ YES | Development/docs |
| **DEEP_CHAT_*.md** | <5 MB | ✅ YES | Development/docs |
| **IMPLEMENTATION_*.md** | <5 MB | ✅ YES | Developer reference |
| ***_TEST.md** | <5 MB | ✅ YES | QA reference only |
| **TESTING_CHECKLIST.md** | <1 MB | ✅ YES | QA only |
| **VISUAL_SUMMARY.md** | <1 MB | ✅ YES | Development only |
| **EXECUTION_REPORT.md** | <1 MB | ✅ YES | Development only |
| **VERIFICATION_REPORT.md** | <1 MB | ✅ YES | Development only |

**Recommendation**: Keep development docs in source but exclude via `.gitignore`. Include only essential docs (README, RELEASE_NOTES) in distribution.

### 🔴 Critical - Never Delete

| Folder/File | Reason |
|------------|--------|
| **src-tauri/src/** | Source code (Rust) |
| **src-tauri/Cargo.toml** | Rust dependencies & config |
| **src-tauri/build.rs** | Build script |
| **src-tauri/icons/** | Application icons |
| **components/** | React/JavaScript components |
| **data/** | Application data |
| **server/** | Backend server code |
| **scripts/** | Build scripts |
| **index.html** | Web entry point |
| **app.js** | Main application script |
| **styles.css** | Styling |
| **package.json** | Node dependencies |
| **tauri.conf.json** | Tauri configuration |
| **.gitignore** | Source control rules |
| **README.md** | Project documentation |

---

## 2. Comprehensive .gitignore Setup

### Root .gitignore

Create/update `.gitignore` in project root:

```
# Build Artifacts & Dependencies
node_modules/
package-lock.json
dist/
desktop-dist/
build/
.next/

# Tauri/Rust Build Output
src-tauri/target/
src-tauri/Cargo.lock

# Environment Variables
.env
.env.local
.env.*.local

# IDE & Editor
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db
*.sublime-project
*.sublime-workspace

# Testing
coverage/
.nyc_output/
junit.xml

# OS Files
*.log
*.pid

# Temporary Files
tmp/
temp/
*.tmp

# Executables & Binaries (except source)
*.exe
*.dll
*.so
*.dylib
!rustup-init.exe

# Distribution Files (build locally)
*.dmg
*.msi
*.deb
*.AppImage
*.zip

# Generated Files
src-tauri/gen/schemas/

# Local Development
.env.development
dev-dist/
```

### src-tauri/.gitignore (Update Existing)

```
# Cargo build artifacts
/target/
Cargo.lock

# Generated schema files
/gen/schemas/

# IDE & Editor
.vscode/
.idea/
*.swp
*.swo
*~

# OS Files
.DS_Store
Thumbs.db
*.log
```

---

## 3. Estimated Size Reductions

### Before Optimization
```
node_modules/              150-300 MB
src-tauri/target/          500-2000 MB
Documentation (*.md)       30-50 MB
Development config files   ~2 MB
─────────────────────────────────────
Total Unoptimized:         700-2350 MB
```

### After .gitignore + Cleanup
```
Source Code:               2-5 MB
Icons & Assets:            2-5 MB
Config Files:              <1 MB
Scripts:                   <1 MB
Essential Docs:            <1 MB
─────────────────────────────────────
Total Repository:          5-12 MB
```

### Size Reduction: **95%+ smaller**

---

## 4. CI/CD Release Process

### Phase 1: Automated Build (GitHub Actions/GitLab CI)

#### Step 1.1: Checkout & Setup
```yaml
- Uses: actions/checkout@v3
- Setup Node.js 18+
- Setup Rust toolchain
- Install Tauri CLI: npm install -g @tauri-apps/cli
```

#### Step 1.2: Dependencies Installation
```bash
npm install                    # Install Node dependencies
cd src-tauri && cargo fetch    # Download Rust dependencies
```

#### Step 1.3: Frontend Build
```bash
node scripts/prepare-desktop.mjs    # Prepare desktop bundle
npm run build:tauri                 # Build Tauri app
```

#### Step 1.4: Build Outputs
The Tauri build generates platform-specific installers:
- **Windows**: `.msi` (installer) + `.exe` (portable)
- **macOS**: `.dmg` (disk image) + `.app` (bundle)
- **Linux**: `.AppImage` + `.deb` (for Ubuntu/Debian)

**Location**: `src-tauri/target/release/bundle/`

### Phase 2: Automated Testing (Optional)

```bash
npm test                       # Run any unit tests
npm run test:e2e             # End-to-end tests (if configured)
```

### Phase 3: Release & Distribution

#### Step 3.1: Create GitHub Release
```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

#### Step 3.2: Upload to Release Assets
Attach build artifacts:
- `Cyber-Kit_0.1.0_x64_en-US.msi` (Windows Installer)
- `Cyber-Kit_0.1.0_x64.app.tar.gz` (macOS)
- `cyber-kit_0.1.0_amd64.AppImage` (Linux AppImage)
- `cyber-kit_0.1.0_amd64.deb` (Linux Debian)

#### Step 3.3: Auto-Update Configuration
Create `latest.json` for auto-updates:
```json
{
  "version": "0.1.0",
  "platforms": {
    "windows-x86_64": {
      "signature": "...",
      "url": "https://github.com/.../releases/download/v0.1.0/..."
    },
    "darwin": {
      "signature": "...",
      "url": "https://github.com/.../releases/download/v0.1.0/..."
    },
    "linux-x86_64": {
      "signature": "...",
      "url": "https://github.com/.../releases/download/v0.1.0/..."
    }
  }
}
```

---

## 5. GitHub Actions Workflow Example

Create `.github/workflows/build-release.yml`:

```yaml
name: Build & Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
            artifact: AppImage
          - os: macos-latest
            target: x86_64-apple-darwin
            artifact: dmg
          - os: windows-latest
            target: x86_64-pc-windows-msvc
            artifact: msi

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}
      
      - name: Install dependencies
        run: npm install
      
      - name: Build Tauri app
        run: npm run build:tauri
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: src-tauri/target/release/bundle/

      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/v')
        uses: softprops/action-gh-release@v1
        with:
          files: src-tauri/target/release/bundle/**/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 6. Pre-Release Checklist

### Code Quality
- [ ] All source code committed
- [ ] No sensitive data in commits
- [ ] Version bumped in `package.json` and `tauri.conf.json`
- [ ] `tauri.conf.json` identifier correct (`com.yourcompany.appname`)

### Testing
- [ ] Application runs locally: `npm run dev:tauri`
- [ ] All features tested on target platforms
- [ ] No console errors or warnings
- [ ] File structure verified

### Distribution
- [ ] All build artifacts generated
- [ ] Platform-specific installers tested
- [ ] Release notes written
- [ ] Changelog updated

### Security
- [ ] No hardcoded credentials
- [ ] No debug mode enabled
- [ ] CORS/CSP properly configured
- [ ] Dependencies up-to-date: `npm audit`

---

## 7. Release Version Workflow

### Version Bumping
Edit `package.json` and `src-tauri/tauri.conf.json`:

```bash
# Current: 0.1.0 → Next: 0.2.0 (minor release)
# Current: 0.1.5 → Next: 0.1.6 (patch release)
# Current: 1.0.0 → Next: 2.0.0 (major release)
```

### Create Release
```bash
git tag -a v0.2.0 -m "Release: Add new features"
git push origin v0.2.0
# GitHub Actions automatically builds and releases
```

---

## 8. Local Build Instructions for Users

Users can build locally with:
```bash
# Clone repository
git clone https://github.com/yourname/cyber-kit.git
cd cyber-kit

# Install dependencies
npm install
cd src-tauri && cargo fetch

# Build desktop app
npm run build:tauri

# Installer/bundle found at:
# src-tauri/target/release/bundle/
```

---

## 9. Maintenance Guidelines

### Regular Cleanup
```bash
# Remove local build artifacts
rm -rf node_modules src-tauri/target dist desktop-dist

# Rebuild fresh
npm install
npm run build:tauri
```

### Dependency Updates
```bash
npm update                          # Update npm packages
npm outdated                        # Check for outdated packages
cd src-tauri && cargo update       # Update Rust dependencies
```

### Git Cleanup
```bash
# Remove untracked files not in .gitignore
git clean -fd

# List what would be removed (safe check)
git clean -nfd
```

---

## 10. Summary: What's in GitHub

✅ **Committed to Repository**:
- Source code (JavaScript, Rust, HTML, CSS)
- Configuration files (package.json, tauri.conf.json)
- Build scripts (prepare-desktop.mjs, build.rs)
- Icons & assets
- Documentation (README, CHANGELOG)
- Lock files (package-lock.json, Cargo.lock)

❌ **Excluded via .gitignore**:
- node_modules/
- src-tauri/target/
- Build output (dist/, desktop-dist/, bundle/)
- Generated schemas
- Environment variables (.env files)
- IDE config (.vscode/, .idea/)
- OS files (.DS_Store, Thumbs.db)
- Temporary files

✅ **Generated During CI/Release**:
- Installers (.msi, .dmg, .AppImage, .deb)
- Release assets uploaded to GitHub Releases
- Auto-update metadata

---

## 11. Disk Space Impact

### Before Cleanup
```
Repository: ~2000+ MB
  - node_modules: 150-300 MB
  - src-tauri/target: 500-2000 MB
  - Docs: 50 MB
```

### After .gitignore
```
Repository: ~10 MB
  - Source code: 5-8 MB
  - Docs: <2 MB
  - Assets: <1 MB
```

### On User's Machine After Clone
```
Fresh Clone: ~10 MB
After npm install: ~160 MB (node_modules)
After build: ~2500 MB (includes src-tauri/target)
  (User can delete after building executable)
```

---

## Next Steps

1. **Update .gitignore** (apply provided files)
2. **Clean repository** (remove existing build artifacts)
3. **Set up CI/CD** (add GitHub Actions workflow)
4. **Test build process** (verify automation)
5. **Create release** (tag version and build)
6. **Distribute** (upload to GitHub Releases)
