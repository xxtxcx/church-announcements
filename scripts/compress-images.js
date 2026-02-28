/**
 * Стиснення медіа в public/assets для зменшення ваги сторінки.
 * Запуск: node scripts/compress-images.js
 * Потрібно: npm install --save-dev sharp
 */
const fs = require("fs");
const path = require("path");

const ASSETS_DIR = path.join(__dirname, "..", "public", "assets");

async function compress() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.warn("sharp не встановлено. Встановіть: npm install --save-dev sharp");
    process.exit(1);
  }

  const exts = [".jpg", ".jpeg", ".png", ".webp"];
  const walk = (dir) => {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) files.push(...walk(full));
      else if (exts.includes(path.extname(name).toLowerCase())) files.push(full);
    }
    return files;
  };

  const files = walk(ASSETS_DIR);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    try {
      let pipeline = sharp(file);
      if ([".jpg", ".jpeg"].includes(ext)) {
        await pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(file + ".tmp");
      } else if (ext === ".png") {
        await pipeline.png({ compressionLevel: 9 }).toFile(file + ".tmp");
      } else {
        continue;
      }
      fs.renameSync(file + ".tmp", file);
      console.log("Compressed:", path.relative(ASSETS_DIR, file));
    } catch (err) {
      console.error("Error:", file, err.message);
    }
  }
  console.log("Done.");
}

compress();
