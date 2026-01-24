# Tauri Distribution - Visual Reference Guide

## 1. File Structure (What Stays, What Goes)

```
cyber-kit/
│
├── 📄 KEEP: .gitignore                     ← Ignore rules
├── 📄 KEEP: package.json                   ← Node deps
├── 📄 KEEP: package-lock.json              ← Lock file
├── 📄 KEEP: README.md                      ← Docs
├── 📄 KEEP: CHANGELOG.md                   ← Version history
├── 📄 KEEP: index.html                     ← Web entry
├── 📄 KEEP: app.js                         ← Main app
├── 📄 KEEP: styles.css                     ← Styling
│
├── 📁 KEEP: .github/
│   └── 📁 workflows/
│       └── 📄 build-release.yml            ← CI/CD pipeline
│
├── 📁 KEEP: components/                    ← React components
│   ├── 📄 command_assist_panel.js
│   ├── 📄 ui_components.js
│   └── ... (more .js files)
│
├── 📁 KEEP: data/                          ← App data
│   ├── 📄 tool_registry.js
│   └── 📄 tool_options.js
│
├── 📁 KEEP: server/                        ← Backend
│   └── 📄 server.js
│
├── 📁 KEEP: scripts/                       ← Build scripts
│   └── 📄 prepare-desktop.mjs
│
├── 📁 KEEP: src-tauri/                     ← Rust code
│   ├── 📄 Cargo.toml                       ← Rust deps
│   ├── 📄 Cargo.lock                       ← Lock file
│   ├── 📄 tauri.conf.json                  ← Config
│   ├── 📄 build.rs                         ← Build script
│   ├── 📄 .gitignore                       ← Rust ignores
│   ├── 📁 icons/                           ← App icons
│   ├── 📁 src/
│   │   ├── 📄 main.rs                      ← Rust entry
│   │   └── 📄 lib.rs
│   ├── 📁 capabilities/
│   ├── 📁 gen/                             ← Generated
│   └── ❌ target/                          ← DELETE
│
├── ❌ node_modules/                        ← DELETE
├── ❌ dist/                                ← DELETE (if exists)
├── ❌ desktop-dist/                        ← DELETE (if exists)
└── ❌ build/                               ← DELETE (if exists)
```

---

## 2. Git Workflow (Release Timeline)

```
┌─────────────────────────────────────────────────────────────┐
│ DEVELOPER LOCAL MACHINE                                     │
└─────────────────────────────────────────────────────────────┘

1. UPDATE FILES (2 min)
   ├─ package.json: version 0.1.0 → 0.2.0
   ├─ tauri.conf.json: version 0.1.0 → 0.2.0
   └─ CHANGELOG.md: Add release notes

2. COMMIT (1 min)
   git add .
   git commit -m "chore: Prepare v0.2.0 release"

3. CREATE TAG (1 min)
   git tag -a v0.2.0 -m "Release v0.2.0"

4. PUSH TAG (1 min)
   git push origin v0.2.0
   
   ↓ TRIGGERS GITHUB ACTIONS ↓

┌─────────────────────────────────────────────────────────────┐
│ GITHUB ACTIONS (AUTOMATIC)                                  │
└─────────────────────────────────────────────────────────────┘

5. BUILD STARTS (~15 min total)
   
   Parallel Builds:
   ┌──────────────────────┐
   │ Windows Build        │ ← .msi installer (7 min)
   │ ✓ npm install        │
   │ ✓ cargo build        │
   │ ✓ tauri build        │
   │ ✓ Generate .msi      │
   └──────────────────────┘
   
   ┌──────────────────────┐
   │ macOS Build          │ ← .dmg installer (10 min)
   │ ✓ npm install        │   (runs twice: x64 + arm64)
   │ ✓ cargo build        │
   │ ✓ tauri build        │
   │ ✓ Generate .dmg      │
   └──────────────────────┘
   
   ┌──────────────────────┐
   │ Linux Build          │ ← .AppImage + .deb (5 min)
   │ ✓ npm install        │
   │ ✓ cargo build        │
   │ ✓ tauri build        │
   │ ✓ Generate bundles   │
   └──────────────────────┘

6. CREATE RELEASE
   ✓ GitHub Release page created
   ✓ Assets uploaded
   ✓ Installers available for download

┌─────────────────────────────────────────────────────────────┐
│ GITHUB RELEASES (AVAILABLE TO USERS)                        │
└─────────────────────────────────────────────────────────────┘

7. DISTRIBUTE
   Users visit: https://github.com/yourname/cyber-kit/releases/
   
   ├─ Windows users
   │  └─ Download: Cyber-Kit_0.2.0_x64_en-US.msi
   │     Run installer
   
   ├─ macOS users
   │  └─ Download: Cyber-Kit_0.2.0_x64.app.tar.gz
   │     Extract and drag to Applications
   
   └─ Linux users
      ├─ Option 1: cyber-kit_0.2.0_amd64.AppImage
      │            Make executable and run
      └─ Option 2: cyber-kit_0.2.0_amd64.deb
                   Install via apt

TOTAL TIME: ~25 minutes (mostly automated)
```

---

## 3. Repository Size Comparison

```
BEFORE (Current)                 AFTER (Optimized)
──────────────────────          ──────────────────────
2,345 MB total                   14 MB total
│                                │
├─ node_modules: 250 MB ❌        ├─ Source code: 4 MB ✅
├─ src-tauri/target: 1,800 MB ❌  ├─ Assets: 2 MB ✅
├─ dist: 25 MB ❌                 ├─ Config: 0.5 MB ✅
├─ desktop-dist: 25 MB ❌         ├─ Docs: 1 MB ✅
├─ build: 150 MB ❌              ├─ .git: 6.5 MB ✅
├─ Source code: 95 MB ✅         └─ Other: 0.5 MB ✅
└─ .git: 150 MB                  
                                 99.4% REDUCTION
SIZE REDUCTION: 99.4%
```

---

## 4. .gitignore Rules (Visual)

```
┌─ Root .gitignore ─────────────────────────────────┐
│                                                    │
│ ✓ Node Dependencies                              │
│   node_modules/              ← 150-300 MB        │
│                                                   │
│ ✓ Rust Build Output                              │
│   src-tauri/target/          ← 500-2000 MB       │
│   src-tauri/Cargo.lock                           │
│                                                   │
│ ✓ Frontend Build Output                          │
│   dist/                      ← 10-50 MB          │
│   desktop-dist/              ← 10-50 MB          │
│   build/                     ← 50-200 MB         │
│   .next/                     ← 50-200 MB         │
│                                                   │
│ ✓ Generated Files                                │
│   src-tauri/gen/schemas/     ← 1-5 MB            │
│   src-tauri/gen/              (auto-generated)   │
│                                                   │
│ ✓ Environment Files                              │
│   .env                       ← Secrets            │
│   .env.local                                     │
│                                                   │
│ ✓ Distribution Artifacts                         │
│   *.msi, *.dmg, *.AppImage   ← Built in CI       │
│   *.deb, *.zip                                   │
│                                                   │
└────────────────────────────────────────────────────┘

┌─ src-tauri/.gitignore ────────────────────────────┐
│                                                    │
│ /target/                     ← Rust build         │
│ Cargo.lock                   ← Cargo lock file    │
│ /gen/schemas/                ← Generated          │
│ .vscode/, .idea/             ← IDE config         │
│ .DS_Store, Thumbs.db         ← OS files           │
│ *.log, *.tmp                 ← Temp files         │
│                                                   │
└────────────────────────────────────────────────────┘
```

---

## 5. CI/CD Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│ GitHub Detects Tag (git push origin v0.2.0)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ GitHub Actions Workflow Triggered (.github/workflows/)      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   WINDOWS   │ │    macOS    │ │    LINUX    │
    │   Build     │ │    Build    │ │    Build    │
    │  (5-7 min)  │ │  (7-10 min) │ │   (3-5 min) │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │                │               │
           ▼                ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Setup     │ │   Setup     │ │   Setup     │
    │   - Node    │ │   - Node    │ │   - Node    │
    │   - Rust    │ │   - Rust    │ │   - Rust    │
    │   - Tauri   │ │   - Tauri   │ │   - System  │
    │             │ │             │ │   - Tauri   │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │                │               │
           ▼                ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ Dependencies│ │ Dependencies│ │ Dependencies│
    │  npm ci     │ │  npm ci     │ │  apt-get    │
    │ cargo fetch │ │ cargo fetch │ │  npm ci     │
    │             │ │             │ │ cargo fetch │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │                │               │
           ▼                ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Build     │ │   Build     │ │   Build     │
    │ npm run     │ │ npm run     │ │ npm run     │
    │  build:     │ │  build:     │ │  build:     │
    │  tauri      │ │  tauri      │ │  tauri      │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │                │               │
           ▼                ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Generate   │ │  Generate   │ │  Generate   │
    │   .msi      │ │   .dmg      │ │ .AppImage   │
    │  installer  │ │  installer  │ │  & .deb pkg │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │                │               │
           │                │ (Apple Silicon)
           │                │ (separate arm64 build)
           │                │
           └────────┬───────┴────────┬──────┘
                    │                │
                    ▼                ▼
           ┌──────────────────────────────┐
           │   Upload Artifacts to        │
           │   GitHub Release Assets      │
           └──────────────┬───────────────┘
                          │
                          ▼
           ┌──────────────────────────────┐
           │   Release Page Created       │
           │   (v0.2.0)                   │
           │   Ready for Users to         │
           │   Download Installers       │
           └──────────────────────────────┘
```

---

## 6. Version Update Locations

```
Files to Update for v0.2.0 Release:

File: package.json
────────────────────
"name": "cyber-kit",
"version": "0.1.0"  ← CHANGE TO: "0.2.0"
              ↑
              This line

File: src-tauri/tauri.conf.json
──────────────────────────────────
{
  "productName": "Cyber Kit",
  "version": "0.1.0"  ← CHANGE TO: "0.2.0"
                ↑
                This line
}

File: CHANGELOG.md (Create or Update)
──────────────────────────────────────
## [0.2.0] - 2024-01-24

### Added
- Feature A
- Feature B

### Fixed
- Bug fix

### Changed
- Improvement
```

---

## 7. Installation Paths After Release

```
USER DOWNLOADS FROM: https://github.com/yourname/cyber-kit/releases/v0.2.0

Windows Installation:
──────────────────────
1. Download: Cyber-Kit_0.2.0_x64_en-US.msi
2. Double-click .msi file
3. Follow installer wizard
4. Launch from Start Menu

macOS Installation:
───────────────────
1. Download: Cyber-Kit_0.2.0_x64.app.tar.gz
2. Extract .tar.gz file
3. Drag "Cyber Kit.app" to Applications folder
4. Launch from Applications (or Cmd+Space → Cyber Kit)

Linux (AppImage):
─────────────────
1. Download: cyber-kit_0.2.0_amd64.AppImage
2. Open terminal in download folder
3. chmod +x cyber-kit_0.2.0_amd64.AppImage
4. ./cyber-kit_0.2.0_amd64.AppImage

Linux (Debian/Ubuntu):
──────────────────────
1. Download: cyber-kit_0.2.0_amd64.deb
2. Double-click .deb (or: sudo apt install ./cyber-kit_0.2.0_amd64.deb)
3. Launch from Applications menu
```

---

## 8. Commands Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│ CLEANUP (One-Time, ~2 min)                              │
├─────────────────────────────────────────────────────────┤
│ rm -rf node_modules                                     │
│ rm -rf src-tauri/target                                 │
│ rm -rf dist desktop-dist build                          │
│ git clean -fd                                           │
│ git status  ← Should show clean tree                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CREATE RELEASE (~5 min)                                 │
├─────────────────────────────────────────────────────────┤
│ Edit package.json             ← version: 0.2.0          │
│ Edit src-tauri/tauri.conf.json ← version: 0.2.0         │
│ Edit CHANGELOG.md             ← Add release notes        │
│                                                          │
│ git add .                                               │
│ git commit -m "chore: Prepare v0.2.0 release"           │
│ git tag -a v0.2.0 -m "Release v0.2.0"                   │
│ git push origin main                                    │
│ git push origin v0.2.0                                  │
│                                                          │
│ ← GitHub Actions now builds automatically (~15 min) →   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ BUILD LOCALLY (For Testing, ~10 min)                    │
├─────────────────────────────────────────────────────────┤
│ npm install                                             │
│ npm run build:tauri                                     │
│ ← Output in: src-tauri/target/release/bundle/           │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Decision Tree: What to Do When

```
                        WANT TO...?
                            │
                ┌───────────┼───────────┐
                │           │           │
                ▼           ▼           ▼
            BUILD    RELEASE    MAINTAIN
            ──────   ─────────   ────────
            
BUILD:
 ├─ For testing
 └─ npm run build:tauri
    └─ Output: src-tauri/target/release/bundle/

RELEASE:
 ├─ Update version (package.json + tauri.conf.json)
 ├─ Commit changes
 ├─ Create tag: git tag -a v0.2.0 -m "..."
 ├─ Push: git push origin v0.2.0
 └─ Wait for GitHub Actions (15 min)

MAINTAIN:
 ├─ Update dependencies
 │  └─ npm update
 │  └─ cd src-tauri && cargo update
 ├─ Test build locally
 │  └─ npm run build:tauri
 └─ Commit changes
    └─ git commit -m "chore: Update dependencies"
```

---

## 10. Success Indicators

```
✅ CLEAN REPOSITORY
   - git status: "nothing to commit, working tree clean"
   - du -sh .: < 15 MB
   - ls -la: NO node_modules/ or src-tauri/target/

✅ FIRST BUILD SUCCESSFUL
   - npm install works
   - npm run build:tauri completes
   - .msi/.dmg/.AppImage/.deb generated

✅ GITHUB ACTIONS WORKING
   - Push tag v0.2.0
   - GitHub Actions tab shows build running
   - All 3 platforms complete successfully
   - Release page created with assets

✅ USERS CAN DOWNLOAD
   - GitHub Releases page accessible
   - All installers present and downloadable
   - Installers test-run successfully

✅ READY FOR PRODUCTION
   - Version numbers consistent
   - CHANGELOG up to date
   - .gitignore excluding build artifacts
   - CI/CD pipeline automated
```

---

**You're now ready to create and distribute release executables automatically!**
