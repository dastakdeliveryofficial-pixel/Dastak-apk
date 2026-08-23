import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Brand Colors
const PINK = [225, 29, 116, 255];      // #E11D74
const DARK_PINK = [194, 24, 91, 255];   // #C2185B
const LIGHT_PINK = [255, 245, 248, 255]; // #FFF5F8
const WHITE = [255, 255, 255, 255];
const GOLD = [245, 158, 11, 255];      // #F59E0B
const DARK_TEXT = [31, 41, 55, 255];    // #1F2937
const GRAY_BG = [243, 244, 246, 255];   // #F3F4F6

function createIcon(size) {
  const png = new PNG({ width: size, height: size, colorType: 6 });
  const center = size / 2;
  const radius = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const dx = (x - center) / radius;
      const dy = (y - center) / radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.28) {
        // Center Golden accent (Food / Delivery motif)
        png.data[idx] = GOLD[0];
        png.data[idx + 1] = GOLD[1];
        png.data[idx + 2] = GOLD[2];
        png.data[idx + 3] = GOLD[3];
      } else if (dist < 0.62) {
        // Inner clean white disc
        png.data[idx] = WHITE[0];
        png.data[idx + 1] = WHITE[1];
        png.data[idx + 2] = WHITE[2];
        png.data[idx + 3] = WHITE[3];
      } else if (dist < 0.88) {
        // Vibrant Pink Circle
        png.data[idx] = PINK[0];
        png.data[idx + 1] = PINK[1];
        png.data[idx + 2] = PINK[2];
        png.data[idx + 3] = PINK[3];
      } else {
        // Maskable safe background zone
        png.data[idx] = LIGHT_PINK[0];
        png.data[idx + 1] = LIGHT_PINK[1];
        png.data[idx + 2] = LIGHT_PINK[2];
        png.data[idx + 3] = LIGHT_PINK[3];
      }
    }
  }

  return PNG.sync.write(png);
}

function createScreenshot(width, height, isMobile) {
  const png = new PNG({ width, height, colorType: 6 });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      if (isMobile) {
        // Mobile UI Mockup
        if (y < height * 0.09) {
          // Pink App Header
          png.data[idx] = PINK[0];
          png.data[idx + 1] = PINK[1];
          png.data[idx + 2] = PINK[2];
          png.data[idx + 3] = 255;
        } else if (y < height * 0.16 && x > width * 0.06 && x < width * 0.94) {
          // Search bar
          png.data[idx] = WHITE[0];
          png.data[idx + 1] = WHITE[1];
          png.data[idx + 2] = WHITE[2];
          png.data[idx + 3] = 255;
        } else if (y > height * 0.92) {
          // Bottom Navigation bar
          png.data[idx] = WHITE[0];
          png.data[idx + 1] = WHITE[1];
          png.data[idx + 2] = WHITE[2];
          png.data[idx + 3] = 255;
        } else {
          // Food Card Grid pattern
          const cardX = (x > width * 0.05 && x < width * 0.95);
          const rowY = Math.floor(y / (height * 0.18));
          const cardY = (y % (height * 0.18)) > (height * 0.02);

          if (cardX && cardY) {
            // Food Card White
            png.data[idx] = WHITE[0];
            png.data[idx + 1] = WHITE[1];
            png.data[idx + 2] = WHITE[2];
            png.data[idx + 3] = 255;
          } else {
            // Background
            png.data[idx] = LIGHT_PINK[0];
            png.data[idx + 1] = LIGHT_PINK[1];
            png.data[idx + 2] = LIGHT_PINK[2];
            png.data[idx + 3] = 255;
          }
        }
      } else {
        // Desktop Dashboard Mockup
        if (y < height * 0.10) {
          // Pink Top Navigation
          png.data[idx] = PINK[0];
          png.data[idx + 1] = PINK[1];
          png.data[idx + 2] = PINK[2];
          png.data[idx + 3] = 255;
        } else if (x < width * 0.22) {
          // Sidebar
          png.data[idx] = WHITE[0];
          png.data[idx + 1] = WHITE[1];
          png.data[idx + 2] = WHITE[2];
          png.data[idx + 3] = 255;
        } else {
          // Content Area
          const gridX = Math.floor((x - width * 0.24) / (width * 0.23));
          const inCardX = (x - width * 0.24) % (width * 0.23) < (width * 0.21);
          const inCardY = (y - height * 0.15) % (height * 0.35) < (height * 0.30);

          if (x > width * 0.24 && x < width * 0.96 && inCardX && inCardY && y > height * 0.15) {
            png.data[idx] = WHITE[0];
            png.data[idx + 1] = WHITE[1];
            png.data[idx + 2] = WHITE[2];
            png.data[idx + 3] = 255;
          } else {
            png.data[idx] = LIGHT_PINK[0];
            png.data[idx + 1] = LIGHT_PINK[1];
            png.data[idx + 2] = LIGHT_PINK[2];
            png.data[idx + 3] = 255;
          }
        }
      }
    }
  }

  return PNG.sync.write(png);
}

// Generate all standard icon sizes
const iconSizes = [48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512];
iconSizes.forEach(size => {
  const buffer = createIcon(size);
  fs.writeFileSync(path.join(publicDir, `icon-${size}.png`), buffer);
  console.log(`✓ Generated icon-${size}.png (${size}x${size}, ${buffer.length} bytes)`);
});

// Favicon & Apple touch icon
fs.writeFileSync(path.join(publicDir, 'favicon.png'), createIcon(48));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createIcon(180));

// Screenshots
const mobileShot = createScreenshot(720, 1280, true);
fs.writeFileSync(path.join(publicDir, 'screenshot-mobile.png'), mobileShot);
console.log(`✓ Generated screenshot-mobile.png (720x1280, ${mobileShot.length} bytes)`);

const desktopShot = createScreenshot(1280, 720, false);
fs.writeFileSync(path.join(publicDir, 'screenshot-desktop.png'), desktopShot);
console.log(`✓ Generated screenshot-desktop.png (1280x720, ${desktopShot.length} bytes)`);

console.log('🎉 All assets generated with official 100% compliant standard PNG encoders!');
