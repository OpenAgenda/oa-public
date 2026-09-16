#!/usr/bin/env node
// Check an OpenAPI contract against what `search_docs` can render.
//
//   yarn workspace @openagenda/mcp check:contract [path/to/openapi.yaml]
//
// Run from the api-spec package's own `validate`, so the person WRITING the
// contract sees the failure while they are writing it — not months later when
// the MCP bumps its dependency, by which time the shape is published and the
// cards have been wrong in between.
//
// Exits 1 with a JSON Pointer per unrenderable construct, and prints the
// deliberate omissions under `--omissions` (what the contract states and no card
// shows). Defaults to the contract this package resolves.

import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import {
  checkContract,
  omissions,
  formatFindings,
} from '../src/docs/compat.js';

const args = process.argv.slice(2);
const wanted = args.filter((arg) => !arg.startsWith('-'));
const path = wanted[0]
  ? new URL(wanted[0], `file://${process.cwd()}/`)
  : new URL(import.meta.resolve('@openagenda/api-spec/openapi.yaml'));

const contract = parse(readFileSync(path, 'utf8'));
const findings = checkContract(contract);

if (args.includes('--omissions')) {
  process.stdout.write(`${omissions(contract).join('\n')}\n`);
}

if (!findings.length) {
  process.stdout.write(
    `search_docs can render every construct in ${path.pathname}.\n`,
  );
  process.exit(0);
}

process.stderr.write(
  [
    `${findings.length} construct(s) in ${path.pathname} that @openagenda/mcp's search_docs cannot render:`,
    formatFindings(findings),
    '',
    'Each one is a card that would drop or misstate what the contract says.',
    'Either change the contract, or teach public/mcp/src/docs/operations.js the',
    'shape and reclassify it in public/mcp/src/docs/compat.js.',
    '',
  ].join('\n'),
);
process.exit(1);
