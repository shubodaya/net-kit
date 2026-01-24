# Cyber Kit - Release & Distribution Quick Start

## Quick Overview

**Goal**: Build and release Cyber Kit as a standalone desktop application with minimal distribution size.

### Current Project Structure
```
cyber-kit/
├── .github/workflows/          ← CI/CD pipelines
├── src-tauri/                  ← Rust/Tauri code
├── components/                 ← JavaScript components
├── data/                        ← App data
├── scripts/                     ← Build scripts
├── package.json                ← Node dependencies
├── tauri.conf.json            ← Tauri config
├── .gitignore                  ← Exclude build artifacts
└── README.md                   ← Project documentation
```

---

## Phase 1: Repository Cleanup (One-Time)

### Step 1: Remove Build Artifacts Locally

```bash
# Delete folders that will be regenerated
rm -rf node_modules
rm -rf src-tauri/target
rm -rf dist
rm -rf desktop-dist
rm -rf build

# Verify clean state
ls -la
# Should NOT see: node_modules, dist, desktop-dist, src-tauri/target
```

### Step 2: Verify .gitignore Updates

Check that both .gitignore files are configured:

**Root `./.gitignore`**:
```
node_modules/
src-tauri/target/
dist/
desktop-dist/
build/
.env
```

**Rust `./ src-tauri/.gitignore`**:
```
/target/
Cargo.lock
/gen/schemas/
```

### Step 3: Clean Git History

```bash
# Remove previously committed artifacts from history (if any)
git log --all --full-history --oneline | grep -i node_modules
# If found, follow git history rewrite procedures

# Otherwise, just proceed:
git add .
git commit -m "chore: Update .gitignore for build artifacts"
git push
```

### Result
✅ Repository size reduced from 2GB+ to ~10 MB

---

## Phase 2: Local Development Build

### Test Build Locally

```bash
# Install dependencies
npm install

# Build desktop version
npm run build:tauri

# Output location:
# Windows: src-tauri/target/release/bundle/msi/
# macOS:   src-tauri/target/release/bundle/dmg/
# Linux:   src-tauri/target/release/bundle/deb/ + AppImage/
```

### Test the Built Application

```bash
# Windows
src-tauri/target/release/Cyber-Kit.exe

# macOS
open src-tauri/target/release/bundle/dmg/Cyber\ Kit.dmg

# Linux
src-tauri/target/release/bundle/appimage/cyber-kit_*.AppImage
```

### Cleanup After Local Build

```bash
# Optional: Remove build artifacts to save disk space
# (can be regenerated anytime)
rm -rf node_modules src-tauri/target
```

---

## Phase 3: Create Release Tag

### Version Format
Use semantic versioning: `vMAJOR.MINOR.PATCH`

Examples:
- `v0.1.0` - Initial release
- `v0.2.0` - Minor features added
- `v0.2.1` - Bug fix
- `v1.0.0` - Major release

### Update Version in Files

Edit two files to bump version:

**1. `package.json`**:
```json
{
  "name": "cyber-kit",
  "version": "0.2.0",
  ...
}
```

**2. `src-tauri/tauri.conf.json`**:
```json
{
  "productName": "Cyber Kit",
  "version": "0.2.0",
  ...
}
```

### Commit & Tag

```bash
# Commit version bump
git add package.json src-tauri/tauri.conf.json
git commit -m "chore: Bump version to 0.2.0"

# Create annotated tag
git tag -a v0.2.0 -m "Release: Add new security features"

# Push to GitHub
git push origin main
git push origin v0.2.0
```

### GitHub Actions Triggers Build

**Automatic**: GitHub Actions automatically:
1. Detects the tag push
2. Builds on Windows, macOS, Linux
3. Creates executables (.msi, .dmg, .AppImage, .deb)
4. Creates GitHub Release with build artifacts
5. Uploads installers for download

---

## Phase 4: Verify Release

### Check GitHub Releases

1. Go to: `https://github.com/yourname/cyber-kit/releases`
2. Click latest release (`v0.2.0`)
3. Verify installers present:
   - ✅ `.msi` (Windows installer)
   - ✅ `.dmg` (macOS installer)
   - ✅ `.AppImage` (Linux)
   - ✅ `.deb` (Ubuntu/Debian package)

### Download & Test

```bash
# Download installer for your OS
# Test installation and functionality
# Verify no broken features
```

---

## Phase 5: Distribute

### Option A: GitHub Releases (Recommended)

Users download from: `https://github.com/yourname/cyber-kit/releases`

**Advantages**:
- Free hosting
- Automatic version management
- Built-in changelogs
- Analytics

### Option B: Website Download

Add to your website:
```html
<a href="https://github.com/yourname/cyber-kit/releases/download/v0.2.0/Cyber-Kit.msi">
  Download for Windows
</a>
```

### Option C: Auto-Updates

Configure `tauri.conf.json` for auto-updates:
```json
{
  "app": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/yourname/cyber-kit/releases/download/latest.json"
      ]
    }
  }
}
```

---

## Typical Release Timeline

| Step | Time | Tool |
|------|------|------|
| Version bump | 2 min | Text editor |
| Commit & tag | 2 min | Git |
| CI build | 10-15 min | GitHub Actions (automatic) |
| Download & test | 5-10 min | Browser |
| **Total** | **20-30 min** | Mostly automated |

---

## Troubleshooting

### Build Fails on GitHub Actions

**Check**: 
1. Go to: GitHub repo → Actions tab → Latest workflow run
2. Click failed job
3. Scroll to error message
4. Common issues:
   - Missing dependencies: Check `npm install` succeeds
   - Version mismatch: Verify `package.json` and `tauri.conf.json` versions match
   - Rust error: Check `cargo check` works locally

### No Installers Generated

**Solution**:
1. Verify `tauri.conf.json` is correct
2. Run locally: `npm run build:tauri`
3. Check output: `src-tauri/target/release/bundle/`

### Large Repository Size

**Cause**: Build artifacts committed to git
**Solution**: 
1. Update `.gitignore` (already done)
2. Verify: `git status` shows no `node_modules/` or `src-tauri/target/`
3. If already committed, clean history (advanced)

---

## Regular Maintenance

### Monthly

```bash
# Update dependencies
npm update
cd src-tauri && cargo update

# Test build
npm run build:tauri

# Commit updates
git add package.json src-tauri/Cargo.toml
git commit -m "chore: Update dependencies"
```

### Before Each Release

```bash
# Full clean build
rm -rf node_modules src-tauri/target
npm install
npm run build:tauri

# Verify all features work
# Run on target OS if possible
# Check for warnings/errors
```

### Release Checklist

- [ ] Version bumped in both `package.json` and `tauri.conf.json`
- [ ] All features tested
- [ ] No console errors
- [ ] Dependencies up-to-date
- [ ] Tag created and pushed
- [ ] GitHub Actions completes successfully
- [ ] All platform installers generated
- [ ] Installers tested on target OS

---

## File Structure for Distribution

After release, users clone and build with:

```bash
git clone https://github.com/yourname/cyber-kit.git
cd cyber-kit
npm install                    # 150 MB (temporary)
npm run build:tauri           # Builds executable
# Delete src-tauri/target and node_modules to save space
```

Or download pre-built:
```bash
# From GitHub Releases
# No build needed, ready to use
```

---

## Key Points

✅ **Source code in GitHub** - All `.js`, `.rs`, `.html`, `.css` files
✅ **Build artifacts excluded** - `node_modules/`, `target/`, `dist/` NOT in git
✅ **CI/CD automated** - GitHub Actions builds all platforms automatically
✅ **Installers public** - GitHub Releases page for user downloads
✅ **Small repository** - ~10 MB instead of 2GB+
✅ **Easy updates** - Just tag a version, CI does the rest

---

## Next Steps

1. ✅ Update `.gitignore` (done)
2. ✅ Add GitHub Actions workflow (done)
3. 🔄 Clean repository: `git add . && git commit -m "cleanup"`
4. 🔄 Create first release tag: `git tag -a v0.1.0 -m "Initial release"`
5. 🔄 Push tag: `git push origin v0.1.0`
6. ✅ Watch GitHub Actions build (automatic)
7. ✅ Download from GitHub Releases

---

## Reference Links

- [Tauri Official Docs](https://tauri.app/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
- [Git Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
