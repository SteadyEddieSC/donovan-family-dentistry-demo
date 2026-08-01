import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(repositoryRoot, 'dist');

const budgets = {
  htmlPerFile: 100 * 1024,
  cssTotal: 240 * 1024,
  jsTotal: 120 * 1024,
  imagePerFile: 220 * 1024,
  imageTotal: 700 * 1024,
  nonDocumentTotal: 1_800 * 1024
};

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

const files = await walk(distRoot);
const records = await Promise.all(files.map(async (absolute) => ({
  absolute,
  relative: path.relative(distRoot, absolute).replaceAll(path.sep, '/'),
  extension: path.extname(absolute).toLowerCase(),
  bytes: (await stat(absolute)).size
})));

const failures = [];
const html = records.filter((record) => record.extension === '.html');
const css = records.filter((record) => record.extension === '.css');
const js = records.filter((record) => ['.js', '.mjs'].includes(record.extension));
const images = records.filter((record) => ['.webp', '.avif', '.png', '.jpg', '.jpeg', '.svg'].includes(record.extension));
const nonDocuments = records.filter((record) => record.extension !== '.pdf');

for (const record of html) {
  if (record.bytes > budgets.htmlPerFile) failures.push(`${record.relative} exceeds the ${budgets.htmlPerFile}-byte HTML budget (${record.bytes}).`);
}

const totals = {
  css: css.reduce((sum, record) => sum + record.bytes, 0),
  js: js.reduce((sum, record) => sum + record.bytes, 0),
  images: images.reduce((sum, record) => sum + record.bytes, 0),
  nonDocuments: nonDocuments.reduce((sum, record) => sum + record.bytes, 0)
};

if (totals.css > budgets.cssTotal) failures.push(`CSS total exceeds ${budgets.cssTotal} bytes (${totals.css}).`);
if (totals.js > budgets.jsTotal) failures.push(`JavaScript total exceeds ${budgets.jsTotal} bytes (${totals.js}).`);
if (totals.images > budgets.imageTotal) failures.push(`Image total exceeds ${budgets.imageTotal} bytes (${totals.images}).`);
if (totals.nonDocuments > budgets.nonDocumentTotal) failures.push(`Non-document site output exceeds ${budgets.nonDocumentTotal} bytes (${totals.nonDocuments}).`);

for (const image of images) {
  if (image.bytes > budgets.imagePerFile) failures.push(`${image.relative} exceeds the ${budgets.imagePerFile}-byte image budget (${image.bytes}).`);
}

const requiredResponsiveImages = [
  ['images/office-exterior-480.webp', 480],
  ['images/office-exterior-720.webp', 720],
  ['images/dr-william-donovan-family-480.webp', 480],
  ['images/dr-william-donovan-family-720.webp', 720],
  ['images/donovan-social-card.webp', 1200]
];

for (const [relative, expectedWidth] of requiredResponsiveImages) {
  const absolute = path.join(distRoot, relative);
  try {
    const metadata = await sharp(absolute).metadata();
    if (metadata.width !== expectedWidth) failures.push(`${relative} should be ${expectedWidth}px wide but is ${metadata.width ?? 'unknown'}px.`);
    if (relative.endsWith('donovan-social-card.webp') && metadata.height !== 630) failures.push(`${relative} should be 630px high but is ${metadata.height ?? 'unknown'}px.`);
  } catch (error) {
    failures.push(`${relative} is missing or unreadable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const modernHomepage = await readFile(path.join(distRoot, 'modern', 'index.html'), 'utf8');
const classicHomepage = await readFile(path.join(distRoot, 'index.html'), 'utf8');
for (const [label, markup] of [['modern homepage', modernHomepage], ['classic homepage', classicHomepage]]) {
  if (!markup.includes('srcset=')) failures.push(`${label} does not expose responsive image candidates.`);
  if (!markup.includes('sizes=')) failures.push(`${label} does not expose responsive image sizing guidance.`);
}

if (failures.length > 0) {
  console.error('Production-candidate performance budgets failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Performance budgets passed: ${html.length} HTML file(s), ${totals.css} CSS bytes, ${totals.js} JavaScript bytes, ${totals.images} image bytes, and ${totals.nonDocuments} non-document bytes.`
);
