const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'frontend/public/images/products');
const assetsDir = path.join(__dirname, 'frontend/public/assets');

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

// A simple 1x1 gray pixel base64 (or slightly larger for visibility)
// Actually, let's make a simple SVG and save it? No, needs to be PNG for the seed references.
// I'll create a 400x400 PNG with a colored background using a buffer.
// Since I can't use 'canvas' package easily without install, I'll just write a minimal valid PNG buffer.
// Minimal colored 1x1 PNGs (Base64)
// Gray
const grayPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
// Blue
const bluePNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwGAmqtg8wAAAABJRU5ErkJggg==', 'base64');
// Red
const redPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');
// Green
const greenPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
// Yellow
const yellowPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAGgwJ1247d5gAAAABJRU5CYII=', 'base64');

const fileMap = {
    'tshirt-front.png': bluePNG,
    'tshirt-back.png': bluePNG,
    'tshirt-lsleeve.png': bluePNG,
    'tshirt-rsleeve.png': bluePNG,

    'hoodie-front.png': redPNG,
    'hoodie-back.png': redPNG,

    'mug-wrap.png': grayPNG,
    'large-mug-body.png': yellowPNG,
    'magic-mug-hidden.png': grayPNG,

    'business-card-front.png': greenPNG,
    'business-card-back.png': greenPNG,
    'flyer-front.png': greenPNG,

    'placeholder-product.png': grayPNG
};

Object.keys(fileMap).forEach(file => {
    fs.writeFileSync(path.join(targetDir, file), fileMap[file]);
    console.log(`Created ${file}`);
});

// Also put one in assets for the default fallback
fs.writeFileSync(path.join(assetsDir, 'placeholder-product.png'), grayPNG);
console.log('Created assets/placeholder-product.png');
