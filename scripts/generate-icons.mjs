import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, '../public/icons/icon.svg');
const outDir = join(__dirname, '../public/icons');

mkdirSync(outDir, { recursive: true });

const svg = readFileSync(svgPath);

const SIZES = [
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
];

for (const { file, size } of SIZES) {
  await sharp(svg).resize(size, size).png().toFile(join(outDir, file));
  console.log(`✓ ${file}`);
}
