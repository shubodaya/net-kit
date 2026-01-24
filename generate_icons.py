#!/usr/bin/env python3
"""
Generate CK icons in all required formats
"""
from PIL import Image, ImageDraw, ImageFont
import os

# Create output directory
icons_dir = "src-tauri/icons"
os.makedirs(icons_dir, exist_ok=True)

# CK branding colors
BACKGROUND = (3, 23, 13)      # Dark green/black #03170d
ACCENT = (44, 255, 103)       # Neon green #2cff67

def create_ck_icon(size):
    """Create CK icon image"""
    img = Image.new('RGBA', (size, size), BACKGROUND)
    draw = ImageDraw.Draw(img)
    
    # Draw border
    border = int(size * 0.08)
    draw.rectangle(
        [(border, border), (size - border, size - border)],
        outline=ACCENT,
        width=int(size * 0.03)
    )
    
    # Draw inner accent border
    inner_border = border + int(size * 0.05)
    draw.rectangle(
        [(inner_border, inner_border), (size - inner_border, size - inner_border)],
        outline=ACCENT,
        width=int(size * 0.015)
    )
    
    # Draw CK text
    try:
        # Try to use a monospace font
        font_size = int(size * 0.45)
        font = ImageFont.truetype("C:\\Windows\\Fonts\\consola.ttf", font_size)
    except:
        # Fallback to default
        font = ImageFont.load_default()
    
    text = "CK"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2 + int(size * 0.05)
    
    draw.text((x, y), text, font=font, fill=ACCENT)
    
    return img

# Generate required sizes
sizes = {
    "32x32.png": 32,
    "128x128.png": 128,
    "128x128@2x.png": 256,
    "icon.png": 256,
}

print("Generating CK icons...")
for filename, size in sizes.items():
    img = create_ck_icon(size)
    path = os.path.join(icons_dir, filename)
    img.save(path)
    print(f"✓ Created {filename} ({size}x{size})")

# Create ICO file (multi-resolution)
print("\nGenerating icon.ico...")
sizes_for_ico = [16, 32, 48, 256]
ico_images = [create_ck_icon(s) for s in sizes_for_ico]
ico_path = os.path.join(icons_dir, "icon.ico")
ico_images[0].save(ico_path, format='ICO', sizes=[(s, s) for s in sizes_for_ico])
print(f"✓ Created icon.ico")

# Create ICNS file for macOS
print("\nGenerating icon.icns...")
try:
    # ICNS requires specific sizes
    icns_sizes = [16, 32, 64, 128, 256, 512, 1024]
    icns_images = [create_ck_icon(s) for s in icns_sizes]
    icns_path = os.path.join(icons_dir, "icon.icns")
    icns_images[0].save(icns_path, format='ICNS', sizes=[(s, s) for s in icns_sizes])
    print(f"✓ Created icon.icns")
except Exception as e:
    print(f"⚠ Could not create ICNS (pillow limitation): {e}")
    print("  Download from: https://icoconvert.com/ instead")

print("\n✅ Icon generation complete!")
