import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const specUrl = new URL('../openapi.yaml', import.meta.url);
const doc = parse(readFileSync(specUrl, 'utf8'));

const errors = [];

for (const key of ['openapi', 'info', 'paths']) {
  if (!doc?.[key]) errors.push(`missing top-level "${key}"`);
}
if (doc?.openapi && !String(doc.openapi).startsWith('3.1')) {
  errors.push(`expected OpenAPI 3.1.x, got "${doc.openapi}"`);
}

function resolveLocalRef(ref) {
  const segments = ref
    .slice(2)
    .split('/')
    .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));
  let node = doc;
  for (const seg of segments) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[seg];
  }
  return node;
}

let refCount = 0;
(function walk(node, trail) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${trail}[${i}]`));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === '$ref' && typeof v === 'string') {
        refCount += 1;
        if (!v.startsWith('#/')) {
          errors.push(
            `external $ref not supported in slice 1: "${v}" at ${trail}`,
          );
        } else if (resolveLocalRef(v) === undefined) {
          errors.push(`unresolved $ref "${v}" at ${trail}`);
        }
      } else {
        walk(v, `${trail}/${k}`);
      }
    }
  }
}(doc, ''));

const pathCount = Object.keys(doc?.paths ?? {}).length;
const schemaCount = Object.keys(doc?.components?.schemas ?? {}).length;

if (errors.length) {
  console.error(`✗ openapi.yaml invalid (${errors.length} issue(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `✓ openapi.yaml parsed — ${pathCount} path(s), ${schemaCount} schema(s), ${refCount} $ref(s) all resolved`,
);
