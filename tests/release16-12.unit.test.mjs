import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import sharp from 'sharp';

const root = new URL('..', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const readJson = async (path) => JSON.parse(await read(path));

async function decodeAsset(asset) {
  const chunks = await Promise.all(asset.chunks.map((name) => read(`.asset-source/${name}`)));
  return gunzipSync(Buffer.from(chunks.map((chunk) => chunk.trim()).join(''), 'base64'));
}

test('Release 16.12 materializes hash-verified provider photos at natural dimensions', async () => {
  const manifest = await readJson('.asset-source/manifest.json');
  const expected = new Map([
    ['public/images/dr-william-donovan-photo.webp', { width: 480, height: 428, bytes: 35822, sha256: '5332280b31c7f0e909dbc75f3ac2b51599d274cabd1e1101f2cb36d840f5c8de' }],
    ['public/images/dr-jordan-henke-family.webp', { width: 480, height: 714, bytes: 49098, sha256: 'ede295f255493a68f5efd2c0853da9b878a7838e0dce96be88834a1c9252d385' }]
  ]);

  for (const [target, details] of expected) {
    const asset = manifest.find((item) => item.target === target);
    assert.ok(asset, `${target} missing from asset manifest`);
    assert.equal(asset.replace, true);
    const bytes = await decodeAsset(asset);
    assert.equal(bytes.length, details.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), details.sha256);
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.format, 'webp');
    assert.equal(metadata.width, details.width);
    assert.equal(metadata.height, details.height);
  }
});

test('Release 16.12 removes captions and prevents provider photo upscaling or forced crops', async () => {
  const [providers, classic, modern, css, classicLayout, modernLayout] = await Promise.all([
    readJson('src/data/providers.json'),
    read('src/pages/about.astro'),
    read('src/pages/modern/team.astro'),
    read('src/styles/release-16-12.css'),
    read('src/layouts/BaseLayout.astro'),
    read('src/layouts/ModernLayout.astro')
  ]);

  assert.deepEqual(providers.map((provider) => provider.photoCaption), ['', '']);
  assert.deepEqual(providers.map((provider) => [provider.photoWidth, provider.photoHeight]), [[480, 428], [480, 714]]);
  assert.doesNotMatch(classic, /photoCaption|figcaption/);
  assert.doesNotMatch(modern, /photoCaption|figcaption/);
  assert.match(css, /max-width:\s*30rem/);
  assert.match(css, /aspect-ratio:\s*auto/);
  assert.match(css, /object-fit:\s*contain/);
  assert.match(classicLayout, /release-16-11\.css[\s\S]*release-16-12\.css/);
  assert.match(modernLayout, /release-16-11\.css[\s\S]*release-16-12\.css/);
});

test('Release 16.12 keeps external Google Fonts out of site source', async () => {
  const paths = [
    'src/layouts/BaseLayout.astro',
    'src/layouts/ModernLayout.astro',
    'src/components/SiteMetadata.astro',
    'src/styles/global.css',
    'src/styles/modern.css',
    'src/styles/font-policy.css',
    'src/styles/release-16-12.css'
  ];
  const source = (await Promise.all(paths.map(read))).join('\n');
  assert.doesNotMatch(source, /fonts\.googleapis\.com|fonts\.gstatic\.com/i);
});
