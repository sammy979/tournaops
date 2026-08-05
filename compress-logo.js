const sharp = require("sharp");
const path = require("path");

const input = path.join(__dirname, "public", "logo.png");
const output = path.join(__dirname, "public", "logo-compressed.png");
const webp = path.join(__dirname, "public", "logo.webp");

sharp(input)
  .resize(400, null, { withoutEnlargement: true })
  .png({ quality: 80, compressionLevel: 9 })
  .toFile(output)
  .then(info => console.log("PNG compressed:", info))
  .catch(err => console.error("PNG error:", err));

sharp(input)
  .resize(400, null, { withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(webp)
  .then(info => console.log("WebP created:", info))
  .catch(err => console.error("WebP error:", err));