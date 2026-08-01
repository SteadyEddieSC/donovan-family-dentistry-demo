import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:dns/promises';
import path from 'node:path';
import tls from 'node:tls';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const SAFE_RESPONSE_HEADERS = [
  'cache-control',
  'content-type',
  'location',
  'server',
  'strict-transport-security',
  'x-robots-tag'
];

export function normalizeInventoryDomain(value) {
  if (typeof value !== 'string') throw new TypeError('Domain must be a string.');
  const domain = value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/\.$/, '');
  if (domain.includes('/') || domain.includes(':')) throw new Error('Domain must not include a path, port, or credentials.');
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
    throw new Error('Domain must be a valid public DNS name.');
  }
  return domain;
}

export function selectSafeHeaders(headers) {
  const result = {};
  for (const name of SAFE_RESPONSE_HEADERS) {
    const value = headers.get(name);
    if (value) result[name] = value;
  }
  return result;
}

export function summarizeInventory(inventory) {
  const recordsWithAnswers = Object.values(inventory.dns).filter((entry) => entry.ok && entry.answers.length > 0).length;
  const recordQueries = Object.keys(inventory.dns).length;
  const reachableHttp = inventory.http.filter((entry) => entry.ok).length;
  const validTls = inventory.tls.filter((entry) => entry.ok && entry.authorized).length;
  return {
    domain: inventory.domain,
    recordQueries,
    recordsWithAnswers,
    reachableHttp,
    validTls,
    warnings: inventory.notes.length
  };
}

async function resolveRecord(name, type) {
  try {
    const answers = await resolve(name, type);
    return { ok: true, name, type, answers };
  } catch (error) {
    return {
      ok: false,
      name,
      type,
      answers: [],
      error: error?.code ?? error?.message ?? String(error)
    };
  }
}

async function inspectHttp(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'DonovanRelease15DomainInventory/1.0'
      }
    });
    await response.body?.cancel();
    return {
      ok: true,
      url,
      status: response.status,
      statusText: response.statusText,
      headers: selectSafeHeaders(response.headers)
    };
  } catch (error) {
    return {
      ok: false,
      url,
      error: error?.name === 'AbortError' ? 'request-timeout' : error?.message ?? String(error)
    };
  } finally {
    clearTimeout(timer);
  }
}

async function inspectTls(hostname) {
  return await new Promise((resolveResult) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        rejectUnauthorized: true,
        timeout: 12_000
      },
      () => {
        const certificate = socket.getPeerCertificate();
        const result = {
          ok: true,
          hostname,
          authorized: socket.authorized,
          authorizationError: socket.authorizationError ?? null,
          protocol: socket.getProtocol(),
          cipher: socket.getCipher()?.name ?? null,
          subject: certificate.subject ?? null,
          issuer: certificate.issuer ?? null,
          validFrom: certificate.valid_from ?? null,
          validTo: certificate.valid_to ?? null,
          subjectAltName: certificate.subjectaltname ?? null,
          fingerprint256: certificate.fingerprint256 ?? null
        };
        socket.end();
        resolveResult(result);
      }
    );

    socket.once('timeout', () => {
      socket.destroy();
      resolveResult({ ok: false, hostname, authorized: false, error: 'tls-timeout' });
    });
    socket.once('error', (error) => {
      resolveResult({
        ok: false,
        hostname,
        authorized: false,
        error: error?.code ?? error?.message ?? String(error)
      });
    });
  });
}

export async function collectDomainInventory(inputDomain) {
  const domain = normalizeInventoryDomain(inputDomain);
  const www = `www.${domain}`;
  const dnsQueries = [
    [domain, 'A'],
    [domain, 'AAAA'],
    [domain, 'MX'],
    [domain, 'NS'],
    [domain, 'TXT'],
    [domain, 'CAA'],
    [www, 'A'],
    [www, 'AAAA'],
    [www, 'CNAME'],
    [`_dmarc.${domain}`, 'TXT'],
    [`autodiscover.${domain}`, 'CNAME'],
    [`autodiscover.${domain}`, 'A'],
    [`mail.${domain}`, 'CNAME'],
    [`mail.${domain}`, 'A'],
    [`portal.${domain}`, 'CNAME'],
    [`portal.${domain}`, 'A'],
    [`appointments.${domain}`, 'CNAME'],
    [`appointments.${domain}`, 'A'],
    [`schedule.${domain}`, 'CNAME'],
    [`schedule.${domain}`, 'A']
  ];

  const dnsResults = await Promise.all(dnsQueries.map(([name, type]) => resolveRecord(name, type)));
  const dns = Object.fromEntries(dnsResults.map((entry) => [`${entry.name}:${entry.type}`, entry]));
  const [httpRoot, httpWww, tlsRoot, tlsWww] = await Promise.all([
    inspectHttp(`https://${domain}/`),
    inspectHttp(`https://${www}/`),
    inspectTls(domain),
    inspectTls(www)
  ]);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    domain,
    scope: 'Public DNS, TLS certificate metadata, and safe HTTP response metadata only. No DNS records are changed.',
    dns,
    http: [httpRoot, httpWww],
    tls: [tlsRoot, tlsWww],
    notes: [
      'DKIM selectors cannot be exhaustively discovered through generic DNS queries; export them from the authoritative DNS provider.',
      'The inventory does not prove record ownership, vendor contracts, mailbox routing, portal behavior, or scheduling-system behavior.',
      'Before cutover, compare this artifact with an authoritative zone export and preserve every non-web record and proxy setting.'
    ]
  };
}

function parseArguments(argv) {
  let domain = 'donovanfamilydentistry.com';
  let output = 'artifacts/domain-inventory.json';
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--domain') domain = argv[++index];
    else if (argument === '--output') output = argv[++index];
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!domain) throw new Error('--domain requires a value.');
  if (!output) throw new Error('--output requires a value.');
  return { domain, output };
}

async function main() {
  const { domain, output } = parseArguments(process.argv.slice(2));
  const inventory = await collectDomainInventory(domain);
  const outputPath = path.resolve(output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');

  const summary = summarizeInventory(inventory);
  console.log(`Domain inventory written to ${outputPath}`);
  console.log(
    `${summary.domain}: ${summary.recordsWithAnswers}/${summary.recordQueries} DNS queries returned answers, ${summary.reachableHttp}/2 HTTPS endpoints responded, and ${summary.validTls}/2 TLS checks were authorized.`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  await main();
}
