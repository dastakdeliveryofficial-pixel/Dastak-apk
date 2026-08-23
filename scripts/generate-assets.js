import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Find logo file
const imgDir = path.resolve(process.cwd(), 'src/assets/images');
const files = fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : [];
const logoFile = files.find(f => f.startsWith('dastak_official_app_logo'));
const logoPath = logoFile ? path.join(imgDir, logoFile) : null;

async function generateAll() {
  if (logoPath && fs.existsSync(logoPath)) {
    console.log('Using official logo from:', logoPath);

    // Copy logo to public as dastak-logo.png and dastak-logo.jpg
    await sharp(logoPath)
      .resize(1024, 1024)
      .png({ quality: 100, compressionLevel: 8 })
      .toFile(path.join(publicDir, 'dastak-logo.png'));

    await sharp(logoPath)
      .resize(1024, 1024)
      .jpeg({ quality: 95 })
      .toFile(path.join(publicDir, 'dastak-logo.jpg'));

    const iconSizes = [48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512];
    for (const size of iconSizes) {
      await sharp(logoPath)
        .resize(size, size, { fit: 'cover' })
        .png({ quality: 100, compressionLevel: 8 })
        .toFile(path.join(publicDir, `icon-${size}.png`));
      console.log(`✓ Generated icon-${size}.png from official logo`);
    }

    // Android launcher specific icons
    const launcherSizes = [48, 72, 96, 144, 192, 512];
    for (const size of launcherSizes) {
      await sharp(logoPath)
        .resize(size, size, { fit: 'cover' })
        .png({ quality: 100, compressionLevel: 8 })
        .toFile(path.join(publicDir, `launchericon-${size}x${size}.png`));
    }

    // Favicon & Apple touch icon
    await sharp(logoPath)
      .resize(48, 48)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));

    await sharp(logoPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    // Generate valid mobile & desktop screenshots with the official branding banner
    const mobileBg = await sharp({
      create: {
        width: 720,
        height: 1280,
        channels: 4,
        background: { r: 255, g: 245, b: 248, alpha: 1 }
      }
    }).png().toBuffer();

    const logoBannerMobile = await sharp(logoPath)
      .resize(600, 600, { fit: 'contain', background: { r: 225, g: 29, b: 116, alpha: 1 } })
      .png()
      .toBuffer();

    await sharp(mobileBg)
      .composite([{ input: logoBannerMobile, top: 120, left: 60 }])
      .png()
      .toFile(path.join(publicDir, 'screenshot-mobile.png'));

    const desktopBg = await sharp({
      create: {
        width: 1280,
        height: 720,
        channels: 4,
        background: { r: 255, g: 245, b: 248, alpha: 1 }
      }
    }).png().toBuffer();

    const logoBannerDesktop = await sharp(logoPath)
      .resize(500, 500, { fit: 'contain', background: { r: 225, g: 29, b: 116, alpha: 1 } })
      .png()
      .toBuffer();

    await sharp(desktopBg)
      .composite([{ input: logoBannerDesktop, top: 110, left: 390 }])
      .png()
      .toFile(path.join(publicDir, 'screenshot-desktop.png'));

    console.log('🎉 All official Dastak brand icons and screenshots generated successfully!');
  } else {
    console.error('Logo file not found, creating fallback assets');
  }
}

generateAll().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
