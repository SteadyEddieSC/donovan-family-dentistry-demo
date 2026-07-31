import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = new URL('..', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, '.asset-source', 'manifest.json'), 'utf8'));

for (const asset of manifest) {
  const target = join(root, asset.target);
  if (existsSync(target)) continue;
  const encoded = asset.chunks
    .map((name) => readFileSync(join(root, '.asset-source', name), 'utf8').trim())
    .join('');
  const compressed = Buffer.from(encoded, 'base64');
  const bytes = gunzipSync(compressed);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, bytes);
  console.log(`Materialized ${asset.target}`);
}
