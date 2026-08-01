import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imageRoot = path.join(repositoryRoot, 'public', 'images');

const responsiveImages = [
  {
    source: 'office-exterior.webp',
    outputBase: 'office-exterior',
    widths: [480, 720]
  },
  {
    source: 'dr-william-donovan-family.webp',
    outputBase: 'dr-william-donovan-family',
    widths: [480, 720]
  }
];

await mkdir(imageRoot, { recursive: true });

for (const definition of responsiveImages) {
  const sourcePath = path.join(imageRoot, definition.source);
  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`${definition.source}: image dimensions could not be read.`);
  }

  for (const width of definition.widths) {
    if (width >= metadata.width) continue;
    const outputPath = path.join(imageRoot, `${definition.outputBase}-${width}.webp`);
    await sharp(sourcePath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6, smartSubsample: true })
      .toFile(outputPath);
    console.log(`Generated ${path.relative(repositoryRoot, outputPath)} (${width}w)`);
  }
}

const socialCardPath = path.join(imageRoot, 'donovan-social-card.webp');
await sharp(path.join(imageRoot, 'office-exterior.webp'))
  .rotate()
  .resize({
    width: 1200,
    height: 630,
    fit: 'contain',
    background: '#fffdf9',
    withoutEnlargement: false
  })
  .webp({ quality: 84, effort: 6, smartSubsample: true })
  .toFile(socialCardPath);
console.log(`Generated ${path.relative(repositoryRoot, socialCardPath)} (1200x630 social card)`);
