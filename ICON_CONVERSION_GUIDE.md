# CK Icon Setup - Quick Steps

Your CK icon SVG has been created: `CK_ICON.svg`

## Convert to Required Formats

You have 3 options:

### Option 1: Online Converter (Easiest)
1. Go to **https://icoconvert.com/**
2. Upload `CK_ICON.svg`
3. Download all formats (PNG, ICO, ICNS)
4. Extract to `src-tauri/icons/`

### Option 2: Use ImageMagick (Windows)
```powershell
# Install ImageMagick from: https://imagemagick.org/script/download.php#windows

# Then run these commands in PowerShell:
magick convert CK_ICON.svg -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico
magick convert CK_ICON.svg -resize 32x32 32x32.png
magick convert CK_ICON.svg -resize 128x128 128x128.png
magick convert CK_ICON.svg -resize 256x256 128x128@2x.png
magick convert CK_ICON.svg -resize 256x256 icon.png

# For macOS (if on Mac):
magick convert CK_ICON.svg icon.icns
```

### Option 3: Use Figma or Inkscape
1. Open `CK_ICON.svg` in Figma or Inkscape
2. Export as PNG for each size (32x32, 128x128, 256x256)
3. Export as ICO (Windows)
4. Export as ICNS (macOS)

## Quick Check

After placing icons in `src-tauri/icons/`, rebuild:
```powershell
npm run build:tauri
```

The new MSI will have the CK icon in:
- ✅ Taskbar
- ✅ Start Menu
- ✅ Installer
- ✅ File Explorer
