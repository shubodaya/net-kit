# Tauri Project - Distribution Cleanup Checklist

## Phase 1: Identify & Plan

### ✅ Folders to Delete Before Distribution

**Build Artifacts (Safe to delete - will be regenerated)**:
```
node_modules/              ~150-300 MB   ← Delete
src-tauri/target/          ~500-2000 MB  ← Delete
dist/                      ~5-50 MB      ← Delete (if exists)
desktop-dist/              ~5-50 MB      ← Delete (if exists)
build/                     ~50-200 MB    ← Delete (if exists)
.next/                     ~50-200 MB    ← Delete (if exists)
src-tauri/gen/schemas/     ~1-5 MB       ← Delete
```

**Lock Files (Keep for reproducible builds)**:
```
package-lock.json          ← KEEP
src-tauri/Cargo.lock       ← KEEP
```

**Documentation (Optional - Delete if space critical)**:
```
CHANGED_FILES.md           ← Delete (dev only)
CHANGES_SUMMARY.md         ← Delete (dev only)
COMPLETION_STATUS.md       ← Delete (dev only)
COMMAND_ASSIST_*.md        ← Delete (dev only)
DEEP_CHAT_*.md             ← Delete (dev only)
IMPLEMENTATION_*.md        ← Delete (dev only)
*_TEST.md                  ← Delete (QA only)
TESTING_CHECKLIST.md       ← Delete (QA only)
EXECUTION_REPORT.md        ← Delete (dev only)
VERIFICATION_REPORT.md     ← Delete (dev only)
VISUAL_SUMMARY.md          ← Delete (dev only)
```

**Files to Keep**:
```
All .js, .rs, .html, .css files   ← KEEP (source)
package.json, tauri.conf.json     ← KEEP (config)
.gitignore files                  ← KEEP (important!)
README.md, CHANGELOG.md           ← KEEP (docs)
icons/, assets/                   ← KEEP
scripts/, components/, data/      ← KEEP (source)
```

---

## Phase 2: Configure .gitignore

### ✅ Root `.gitignore` Verification

File: `d:\websites\inprogress\z-tools\cyber-kit\.gitignore`

**Should contain**:
```
# Build Artifacts
node_modules/
dist/
desktop-dist/
build/

# Tauri/Rust
src-tauri/target/
src-tauri/Cargo.lock

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# Generated
src-tauri/gen/schemas/

# Distribution files
*.msi
*.dmg
*.deb
*.AppImage
```

**Status**: ✅ Updated

### ✅ Rust `.gitignore` Verification

File: `d:\websites\inprogress\z-tools\cyber-kit\src-tauri\.gitignore`

**Should contain**:
```
/target/
Cargo.lock
/gen/schemas/
.vscode/
.DS_Store
```

**Status**: ✅ Updated

---

## Phase 3: Git Operations

### ✅ Check Current Status

```bash
# View current tracked files
git ls-files | head -20

# View what would be committed
git status

# Check .gitignore effectiveness
git check-ignore -v node_modules/
git check-ignore -v src-tauri/target/
```

**Expected output**:
```
node_modules/ is ignored (via .gitignore)
src-tauri/target/ is ignored (via .gitignore)
```

### ✅ Remove Previously Committed Artifacts (If Any)

**Check if already committed**:
```bash
git log --name-status | grep -E "node_modules|target/" | head -5
```

**If found**: These need to be removed from history

```bash
# Option 1: Remove from latest commit
git rm -r --cached node_modules/
git rm -r --cached src-tauri/target/
git commit -m "chore: Remove build artifacts from git"
git push origin main
```

**Option 2: Clean entire history (Advanced)**:
```bash
# Using BFG Repo-Cleaner (recommended for large artifacts)
bfg --delete-folders node_modules,target repo.git
```

### ✅ Add Updated .gitignore

```bash
git add .gitignore src-tauri/.gitignore
git commit -m "chore: Improve .gitignore for build artifacts and generated files"
git push origin main
```

---

## Phase 4: Local Cleanup

### ✅ Step 1: Verify Current Size

**Windows**:
```powershell
# Check folder sizes
Get-ChildItem -Recurse -ErrorAction SilentlyContinue | 
  Measure-Object -Property Length -Sum | 
  Select-Object @{Name="Size (GB)"; Expression={[Math]::Round(_.Sum / 1GB, 2)}}
```

**macOS/Linux**:
```bash
du -sh *
du -sh src-tauri/target
du -sh node_modules
```

**Expected before cleanup**:
```
node_modules/        150-300 MB
src-tauri/target/    500-2000 MB
Total               700-2300 MB
```

### ✅ Step 2: Create Backup (Optional)

```bash
# Backup before deleting (safety)
tar czf cyber-kit-backup.tar.gz .git .gitignore
# Or use Windows:
# 7-Zip or Windows Explorer → Send to → Compressed folder
```

### ✅ Step 3: Delete Build Artifacts

**Windows**:
```powershell
# Delete folders
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force src-tauri\target
Remove-Item -Recurse -Force dist
Remove-Item -Recurse -Force desktop-dist
Remove-Item -Recurse -Force build
Remove-Item -Recurse -Force .next

# Verify deletion
Get-ChildItem -Directory | Select-Object Name
# Should NOT show: node_modules, target, dist, etc.
```

**macOS/Linux**:
```bash
rm -rf node_modules
rm -rf src-tauri/target
rm -rf dist
rm -rf desktop-dist
rm -rf build
rm -rf .next

# Verify
ls -la
# Should NOT show the deleted folders
```

### ✅ Step 4: Clean Git Index

```bash
# Clear git cache for ignored files
git clean -fd
git clean -fdx

# Verify untracked files removed
git status
# Should show: "nothing to commit, working tree clean"
```

---

## Phase 5: Verify Cleanup

### ✅ Check Repository Size After Cleanup

**Windows**:
```powershell
(Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
```

**macOS/Linux**:
```bash
du -sh .
```

**Expected after cleanup**:
```
Total: 10-15 MB  ✅
```

### ✅ Verify Git Tracking

```bash
# List all tracked files (should be source only)
git ls-files | wc -l
# Should be ~50-100 files (not thousands)

# Check no large binaries
git ls-files -s | awk '{print $4}' | xargs ls -lh | grep -E 'M|G'
# Should show nothing or only small files
```

### ✅ Verify Source Files Present

```bash
# Check critical files exist
ls package.json                    # ✓ Present
ls src-tauri/Cargo.toml           # ✓ Present
ls src-tauri/src/main.rs          # ✓ Present
ls components/                     # ✓ Directory exists
ls data/                           # ✓ Directory exists
git ls-files | grep '\.js$' | wc -l   # Should show ~15+ JS files
git ls-files | grep '\.rs$' | wc -l   # Should show ~2+ RS files
```

---

## Phase 6: Prepare for Distribution

### ✅ Update Version Numbers

**File 1: `package.json`**
```json
{
  "name": "cyber-kit",
  "version": "0.2.0",  ← Update this
  "type": "module",
  ...
}
```

**File 2: `src-tauri/tauri.conf.json`**
```json
{
  "productName": "Cyber Kit",
  "version": "0.2.0",  ← Update this
  "identifier": "com.tauri.dev",
  ...
}
```

**Verify both match**:
```bash
grep '"version"' package.json
grep '"version"' src-tauri/tauri.conf.json
# Both should show: 0.2.0
```

### ✅ Create CHANGELOG Entry

Create/update `CHANGELOG.md`:
```markdown
# Changelog

## [0.2.0] - 2024-01-24

### Added
- Feature 1
- Feature 2

### Fixed
- Bug fix 1
- Bug fix 2

### Changed
- Improvement 1
```

### ✅ Verify Critical Files

Checklist before tagging release:

```
Source Code:
  ✓ app.js present
  ✓ index.html present
  ✓ styles.css present
  ✓ components/ directory with .js files
  ✓ data/ directory with app data
  ✓ scripts/ directory with build scripts
  ✓ src-tauri/src/main.rs present

Configuration:
  ✓ package.json version updated
  ✓ tauri.conf.json version updated
  ✓ tauri.conf.json identifier correct
  ✓ .gitignore updated

Build System:
  ✓ .github/workflows/build-release.yml created
  ✓ scripts/prepare-desktop.mjs present
  ✓ src-tauri/build.rs present

Documentation:
  ✓ README.md present
  ✓ CHANGELOG.md present or created
  ✓ RELEASE_QUICK_START.md present
  ✓ TAURI_OPTIMIZATION_GUIDE.md present

Git Status:
  ✓ Repository size < 15 MB
  ✓ git status shows clean working tree
  ✓ No node_modules or target/ in git ls-files
```

---

## Phase 7: Create Release Tag

### ✅ Commit Changes

```bash
# Stage version updates and documentation
git add package.json src-tauri/tauri.conf.json CHANGELOG.md

# Commit
git commit -m "chore: Prepare v0.2.0 release

- Bump version to 0.2.0
- Update changelog
- Ready for automated CI build"

# Push
git push origin main
```

### ✅ Create Git Tag

```bash
# Create annotated tag (recommended)
git tag -a v0.2.0 -m "Release v0.2.0: Add new security features"

# Or lightweight tag
git tag v0.2.0

# Verify tag created
git tag -l | grep v0.2.0
git show v0.2.0

# Push tag to GitHub
git push origin v0.2.0

# Verify on GitHub
# Visit: https://github.com/yourname/cyber-kit/releases/
# Should see new tag and CI automatically building
```

---

## Phase 8: Verify CI/CD Build

### ✅ Monitor GitHub Actions

1. Go to: `https://github.com/yourname/cyber-kit/actions`
2. Click the workflow run for your tag
3. Monitor build progress:
   ```
   Windows build    [████████░░] 50%
   macOS build      [██████░░░░] 30%
   Linux build      [████░░░░░░] 20%
   ```

### ✅ Wait for Completion

**Expected time**: 10-15 minutes total

**Successful indicators**:
```
✓ All three platform builds succeed
✓ Artifacts uploaded
✓ GitHub Release created
✓ Download assets visible
```

### ✅ Download & Test Installers

From: `https://github.com/yourname/cyber-kit/releases/v0.2.0`

Download platform-specific installer:
- Windows: `Cyber-Kit_0.2.0_x64_en-US.msi`
- macOS: `Cyber-Kit_0.2.0_x64.app.tar.gz`
- Linux: `cyber-kit_0.2.0_amd64.AppImage`

Test on target OS:
```bash
# Windows
msiexec /i Cyber-Kit_0.2.0_x64_en-US.msi

# macOS
tar xzf Cyber-Kit_0.2.0_x64.app.tar.gz
open "Cyber Kit.app"

# Linux
chmod +x cyber-kit_0.2.0_amd64.AppImage
./cyber-kit_0.2.0_amd64.AppImage
```

---

## Phase 9: Post-Release

### ✅ Create Release Notes

On GitHub Release page, add description:

```markdown
## Cyber Kit v0.2.0

Enhanced security features and improved UI.

### What's New
- Deep Chat integration with multi-tool support
- Command Assist for 6 vendor platforms
- Incident Triage workflow automation
- Threat Intelligence search
- Phishing analysis tools

### Installation
- **Windows**: Download `.msi` and run installer
- **macOS**: Download `.dmg` and drag to Applications  
- **Linux**: Download `.AppImage` or `.deb` package

### System Requirements
- Windows 10+ (x64)
- macOS 10.13+ (Intel or Apple Silicon)
- Ubuntu 18.04+ or any Linux with GTK 3.6+

### Known Issues
- None at this time

### Credits
Built with Tauri, React, Rust
```

### ✅ Announce Release

Share on:
- GitHub Discussions
- Project website
- Social media (if applicable)
- Email newsletter

---

## Phase 10: Cleanup Checklist Summary

### ✅ Files/Folders Deleted
```
☑ node_modules/
☑ src-tauri/target/
☑ dist/
☑ desktop-dist/
☑ build/
☑ .next/
☑ src-tauri/gen/schemas/
```

### ✅ Configuration Updated
```
☑ .gitignore expanded
☑ src-tauri/.gitignore enhanced
☑ package.json version bumped
☑ tauri.conf.json version bumped
```

### ✅ CI/CD Setup
```
☑ .github/workflows/build-release.yml created
☑ GitHub Actions configured
☑ Multi-platform builds enabled
```

### ✅ Distributed
```
☑ Git repository < 15 MB
☑ GitHub Release created
☑ Installers available for download
☑ Release notes published
```

### ✅ Verified
```
☑ Repository clean (git status clean)
☑ No build artifacts in git tracking
☑ All source files present
☑ Installers tested on target OS
```

---

## Quick Command Reference

```bash
# Complete cleanup workflow
rm -rf node_modules src-tauri/target dist desktop-dist build .next
git clean -fd
git status

# Verify size
du -sh .

# Update versions
# Edit: package.json, tauri.conf.json, CHANGELOG.md
git add .
git commit -m "chore: Prepare v0.2.0 release"

# Create tag
git tag -a v0.2.0 -m "Release v0.2.0"

# Push (triggers CI)
git push origin v0.2.0

# Monitor
# Open: https://github.com/yourname/cyber-kit/actions

# Download from
# https://github.com/yourname/cyber-kit/releases/v0.2.0
```

---

## Troubleshooting

### Large .git folder?
**Cause**: Build artifacts previously committed
**Solution**: 
```bash
git gc --aggressive --prune=all
```

### CI Build Fails?
**Solution**:
1. Check workflow logs
2. Verify versions match in both files
3. Run locally: `npm run build:tauri`
4. Fix errors and re-push tag

### Size Still Large?
**Check**:
```bash
git ls-files | xargs du -s | sort -n | tail -20
# Shows largest tracked files
```

---

## Status

- ✅ .gitignore configured
- ✅ CI/CD workflow created
- ✅ Documentation provided
- 🔄 Ready for first release tag
- 🔄 Awaiting manual cleanup execution

**Next Step**: Follow Phase 3-7 above to create first v0.2.0 release
