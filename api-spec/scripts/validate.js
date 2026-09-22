import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

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

// Example validation — every example must validate against its own schema, so a
// drifting example (renamed field, wrong enum, extra key under
// `additionalProperties: false`, malformed date) fails here instead of silently
// going stale in the docs. Covers schema-level examples (including nested field
// examples) plus media-type / parameter / header examples.
const schemas = doc.components?.schemas ?? {};
const ajv = new Ajv2020({ strict: false, allowUnionTypes: true });
addFormats(ajv);

let exampleCount = 0;
let compileId = 0;
const validatorCache = new Map();

// Compile a schema with the component schemas in scope so `$ref`s resolve. A
// pure `$ref` site is cached so repeated references reuse one validator.
function validatorFor(schema, where) {
  const cacheKey = typeof schema?.$ref === 'string' ? schema.$ref : null;
  if (cacheKey && validatorCache.has(cacheKey)) return validatorCache.get(cacheKey);
  let validate = null;
  try {
    compileId += 1;
    validate = ajv.compile({
      $id: `oa-check-${compileId}`,
      components: { schemas },
      ...schema,
    });
  } catch (e) {
    errors.push(`cannot compile schema for example at ${where}: ${e.message}`);
  }
  if (cacheKey) validatorCache.set(cacheKey, validate);
  return validate;
}

function checkExample(schema, value, where) {
  const validate = validatorFor(schema, where);
  if (!validate) return;
  exampleCount += 1;
  if (!validate(value)) {
    for (const e of validate.errors) {
      errors.push(
        `invalid example at ${where}${e.instancePath} — ${e.message} ${JSON.stringify(e.params)}`,
      );
    }
  }
}

// Recurse a schema object, validating its own `example`/`examples` and those of
// every nested subschema. At schema level `examples` is the JSON Schema array form.
const SUB_SINGLE = [
  'items',
  'additionalProperties',
  'not',
  'if',
  'then',
  'else',
  'contains',
  'propertyNames',
];
const SUB_MAP = ['properties', 'patternProperties', '$defs', 'definitions'];
const SUB_ARRAY = ['allOf', 'anyOf', 'oneOf', 'prefixItems'];

function walkSchema(schema, where) {
  if (!schema || typeof schema !== 'object') return;
  if ('example' in schema) checkExample(schema, schema.example, where);
  if (Array.isArray(schema.examples)) {
    schema.examples.forEach((ex, i) =>
      checkExample(schema, ex, `${where}/examples[${i}]`));
  }
  for (const k of SUB_SINGLE) {
    if (schema[k] && typeof schema[k] === 'object') walkSchema(schema[k], `${where}/${k}`);
  }
  for (const k of SUB_MAP) {
    if (schema[k] && typeof schema[k] === 'object') {
      for (const [p, s] of Object.entries(schema[k])) walkSchema(s, `${where}/${k}/${p}`);
    }
  }
  for (const k of SUB_ARRAY) {
    if (Array.isArray(schema[k])) schema[k].forEach((s, i) => walkSchema(s, `${where}/${k}[${i}]`));
  }
}

for (const [name, schema] of Object.entries(schemas)) {
  walkSchema(schema, `#/components/schemas/${name}`);
}

// Media-type / parameter / header example sites: any object carrying BOTH a
// `schema` and an `example`, or `examples` in the OpenAPI map form ({name:{value}}).
(function walkSites(node, trail) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkSites(v, `${trail}[${i}]`));
  } else if (node && typeof node === 'object') {
    if (node.schema && typeof node.schema === 'object') {
      if ('example' in node) checkExample(node.schema, node.example, `${trail}/example`);
      if (
        node.examples
        && typeof node.examples === 'object'
        && !Array.isArray(node.examples)
      ) {
        for (const [exName, ex] of Object.entries(node.examples)) {
          if (ex && typeof ex === 'object' && 'value' in ex) {
            checkExample(node.schema, ex.value, `${trail}/examples/${exName}`);
          }
        }
      }
    }
    for (const [k, v] of Object.entries(node)) walkSites(v, `${trail}/${k}`);
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
  `✓ openapi.yaml parsed — ${pathCount} path(s), ${schemaCount} schema(s), `
    + `${refCount} $ref(s) all resolved, ${exampleCount} example(s) valid`,
);
