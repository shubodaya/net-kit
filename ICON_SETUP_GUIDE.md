# Cyber Kit Icon Setup Guide

## Overview
This guide shows exactly how to set up the CK (Cyber Kit) icon for all platforms (Windows, macOS, Linux) in the Tauri application.

---

## 1. Icon File Directory Structure

Create and maintain icons in this location:
```
cyber-kit/
└── src-tauri/
    └── icons/
        ├── 32x32.png              ← Linux icon (small)
        ├── 128x128.png            ← Linux icon (standard)
        ├── 128x128@2x.png         ← Linux icon (retina)
        ├── icon.png               ← General purpose PNG
        ├── icon.ico               ← Windows icon (all resolutions combined)
        ├── icon.icns              ← macOS icon (all resolutions combined)
        ├── Square30x30Logo.png    ← Windows UWP (30×30)
        ├── Square44x44Logo.png    ← Windows UWP (44×44)
        ├── Square71x71Logo.png    ← Windows UWP (71×71)
        ├── Square89x89Logo.png    ← Windows UWP (89×89)
        ├── Square107x107Logo.png  ← Windows UWP (107×107)
        ├── Square142x142Logo.png  ← Windows UWP (142×142)
        ├── Square150x150Logo.png  ← Windows UWP (150×150)
        ├── Square284x284Logo.png  ← Windows UWP (284×284)
        ├── Square310x310Logo.png  ← Windows UWP (310×310)
        └── StoreLogo.png          ← Windows Store (50×50)
```

---

## 2. Required Icon Formats & Sizes

### Windows (.ico format)
**File**: `icon.ico`
**What it is**: Multi-resolution icon containing:
- 16×16 px
- 24×24 px
- 32×32 px
- 48×48 px
- 64×64 px (optional)
- 128×128 px (optional)
- 256×256 px (optional)

**Used for**: Taskbar, title bar, file explorer, installer

**How to create**:
```bash
# Using ImageMagick or similar tool
magick convert CK.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico

# Or use online: https://icoconvert.com/
# Upload CK.png (at least 256×256) → Download icon.ico
```

### Windows UWP Icons (.png format)
**Files**: `Square*.png` (multiple resolutions)

| File | Size | Purpose |
|------|------|---------|
| Square30x30Logo.png | 30×30 | Start menu tile |
| Square44x44Logo.png | 44×44 | Taskbar tile |
| Square71x71Logo.png | 71×71 | Small tile |
| Square89x89Logo.png | 89×89 | Medium tile |
| Square107x107Logo.png | 107×107 | Large tile |
| Square142x142Logo.png | 142×142 | XL tile |
| Square150x150Logo.png | 150×150 | Start menu |
| Square284x284Logo.png | 284×284 | Large tile |
| Square310x310Logo.png | 310×310 | XL start menu |
| StoreLogo.png | 50×50 | Microsoft Store |

**How to create**: Scale your CK.png to each required size and save

### macOS (.icns format)
**File**: `icon.icns`
**What it is**: Apple Icon Image format containing multiple resolutions:
- 16×16 px
- 32×32 px
- 64×64 px
- 128×128 px
- 256×256 px
- 512×512 px
- 1024×1024 px

**Used for**: Dock, Finder, app bundle, installer

**How to create**:
```bash
# Method 1: Online tool
# https://icoconvert.com/ → Select ICNS format
# Upload CK.png (at least 1024×1024) → Download icon.icns

# Method 2: macOS command line (requires PNG at least 1024×1024)
# mkdir Cyber\ Kit.iconset
# sips -z 16 16 CK.png --out Cyber\ Kit.iconset/icon_16x16.png
# sips -z 32 32 CK.png --out Cyber\ Kit.iconset/icon_32x32.png
# ... (create all sizes)
# iconutil -c icns Cyber\ Kit.iconset
```

### Linux (.png format)
**Files**: `32x32.png`, `128x128.png`, `128x128@2x.png`

| File | Size | Purpose |
|------|------|---------|
| 32x32.png | 32×32 | Standard Linux icon |
| 128x128.png | 128×128 | Linux icon library |
| 128x128@2x.png | 256×256 | Retina/HiDPI displays |

**How to create**: Scale CK.png to 32×32, 128×128, and 256×256

### General Purpose PNG
**File**: `icon.png`
**Size**: 256×256 px minimum (512×512 recommended for future proofing)
**Purpose**: Fallback for various uses

---

## 3. Icon Source Recommendation

**Step 1: Get the CK Icon**

Option A: If you have a CK.png file already
```bash
# Ensure it's at least 1024×1024 pixels
# Copy to a working directory
```

Option B: Create a simple CK icon
Use a design tool like:
- Adobe Illustrator
- Affinity Designer
- Figma (free)
- Inkscape (free, open source)

Design criteria for "CK" branding:
- Monogram or badge design with "CK" letters
- Use professional colors (recommend: gradient blue/green or solid tech color)
- Clear at small sizes (32×32)
- High contrast for visibility
- Square format (1:1 aspect ratio)

---

## 4. Creating All Icons from Source

**Starting point**: `CK.png` (1024×1024 or larger)

### Batch Processing (Recommended)

Using ImageMagick (install via `choco install imagemagick` on Windows):

```powershell
# Navigate to src-tauri/icons directory
cd src-tauri/icons

# Create Windows ICO (multi-resolution)
magick convert CK.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico

# Create PNG variants
magick convert CK.png -resize 32x32 32x32.png
magick convert CK.png -resize 128x128 128x128.png
magick convert CK.png -resize 256x256 128x128@2x.png
magick convert CK.png -resize 256x256 icon.png

# Windows UWP tiles
magick convert CK.png -resize 30x30 Square30x30Logo.png
magick convert CK.png -resize 44x44 Square44x44Logo.png
magick convert CK.png -resize 71x71 Square71x71Logo.png
magick convert CK.png -resize 89x89 Square89x89Logo.png
magick convert CK.png -resize 107x107 Square107x107Logo.png
magick convert CK.png -resize 142x142 Square142x142Logo.png
magick convert CK.png -resize 150x150 Square150x150Logo.png
magick convert CK.png -resize 284x284 Square284x284Logo.png
magick convert CK.png -resize 310x310 Square310x310Logo.png
magick convert CK.png -resize 50x50 StoreLogo.png
```

### Online Tools (No Install Required)

1. **For .ico**: https://icoconvert.com/
   - Upload `CK.png`
   - Download `icon.ico`

2. **For .icns**: https://icoconvert.com/
   - Upload `CK.png`
   - Select ICNS format
   - Download `icon.icns`

3. **For PNG resizing**: Use any online image resizer like:
   - https://resizeimage.net/
   - https://www.befunky.com/create/resize-image/
   - Or use a script with FFmpeg/ImageMagick

---

## 5. Tauri Configuration

The `src-tauri/tauri.conf.json` already has correct icon references:

```json
{
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

✅ **This configuration is correct and doesn't need changes.**

The paths reference the icons relative to `src-tauri/` directory.

---

## 6. Icon Verification Checklist

After placing icons in `src-tauri/icons/`:

### File Presence
```powershell
cd D:\websites\inprogress\z-tools\cyber-kit\src-tauri\icons

# Check all required files exist
ls *.png
ls *.ico
ls *.icns
```

✅ All files listed above should be present.

### File Sizes (Quick Validation)
```powershell
# Windows ICO should be 30-100 KB
# macOS ICNS should be 100-300 KB
# PNG files should be 5-50 KB each
```

### Format Validation
```powershell
# Windows ICO file
file icon.ico  # Should output: "MS Windows icon resource"

# macOS ICNS file
file icon.icns  # Should output: "Mac OS X icon file"

# PNG files
file 32x32.png  # Should output: "PNG image data"
```

---

## 7. Platform-Specific Icon Usage

### Windows
- **.ico file** → Taskbar, title bar, installer, file associations
- **Square*.png files** → Start menu tiles, Windows Widgets, notifications

### macOS
- **.icns file** → Dock, Finder, app bundle icon, installer background

### Linux
- **32x32.png** → Application menu, file manager icons
- **128x128.png** → App launchers, large displays
- **128x128@2x.png** → High-DPI displays (laptop retina screens)

---

## 8. Testing Icon Display

### Windows (After Building)
1. Build: `npm run build:tauri`
2. Check installer:
   ```
   src-tauri/target/release/bundle/msi/Cyber-Kit_*.msi
   ```
3. Right-click on `.msi` → Properties
   - ✅ Icon should display in Properties dialog
   - ✅ Icon should appear in Windows Explorer

4. Run installer and check:
   - ✅ Icon appears in "Add/Remove Programs"
   - ✅ Icon appears on Desktop shortcut
   - ✅ Icon appears in Taskbar when running

### macOS (After Building)
1. Build: `npm run build:tauri` (on macOS)
2. Check app bundle:
   ```
   src-tauri/target/release/bundle/macos/Cyber Kit.app
   ```
3. Right-click app → Get Info
   - ✅ Icon displays in top-left corner
   - ✅ Icon matches ICNS file

4. Drag app to Dock
   - ✅ Icon appears in Dock
   - ✅ Icon matches expected branding

### Linux (After Building)
1. Build: `npm run build:tauri` (on Linux)
2. Check AppImage:
   ```
   src-tauri/target/release/bundle/appimage/cyber-kit_*.AppImage
   ```
3. Check application menu
   - ✅ Icon appears when launching from app menu
   - ✅ Icon displayed in file manager

---

## 9. Troubleshooting

### Icon Not Showing in Windows Installer
**Problem**: Icon doesn't appear in installer
**Solution**:
1. Verify `icon.ico` exists in `src-tauri/icons/`
2. Check file isn't corrupted: `file icon.ico`
3. Rebuild: `npm run build:tauri`
4. Clear cache: `rm -r src-tauri/target/release`

### Icon Not Showing in macOS App
**Problem**: Icon appears as generic app icon
**Solution**:
1. Verify `icon.icns` is valid: `file icon.icns`
2. Check ICNS contains all required sizes (16, 32, 64, 128, 256, 512, 1024)
3. Use: `iconutil -info icon.icns` to validate
4. Rebuild on macOS: `npm run build:tauri`

### Icon Not Showing in Linux
**Problem**: Icon doesn't display in app menu or Dock
**Solution**:
1. Verify PNG files exist and are 32×32, 128×128, 256×256
2. Check PNG files aren't corrupted: `file *.png`
3. Ensure `tauri.conf.json` references correct paths
4. Rebuild: `npm run build:tauri`

---

## 10. Best Practices

1. **Version Control**: 
   - ✅ Commit icon files to Git
   - ✅ Store source SVG/design file separately
   - ❌ Don't include multiple redundant formats

2. **Updates**:
   - If changing icon, update all formats simultaneously
   - Maintain aspect ratio (1:1)
   - Test on all platforms after changes

3. **Performance**:
   - Keep file sizes reasonable
   - Use PNG compression for PNGs
   - `.ico` and `.icns` contain multiple resolutions, no separate compression needed

4. **Consistency**:
   - Ensure all platform versions look visually similar
   - Match branding guidelines
   - Test at actual display sizes (32×32 in taskbar, etc.)

---

## Summary Checklist

- [ ] Have `CK.png` source image (1024×1024+ pixels)
- [ ] Created `icon.ico` from source
- [ ] Created `icon.icns` from source
- [ ] Created PNG files (32×32, 128×128, 128×128@2x)
- [ ] Created Windows UWP tiles (Square*.png files)
- [ ] All files in `src-tauri/icons/` directory
- [ ] `tauri.conf.json` has correct icon references
- [ ] Built app: `npm run build:tauri`
- [ ] Tested icon on Windows (installer, taskbar)
- [ ] Tested icon on macOS (dock, Finder)
- [ ] Tested icon on Linux (app menu)
- [ ] All platform icons display correctly

---

**Need help creating icons?** Use these free tools:
- **Figma**: https://figma.com (free tier available)
- **Inkscape**: https://inkscape.org (open source)
- **Online converter**: https://icoconvert.com/
- **Batch resize**: ImageMagick (`choco install imagemagick` on Windows)
