// Smoke test: spawns the MCP server over stdio (inheriting OA_* from the env),
// then exercises the two tools AND proves the sandbox boundary holds.
//
//   OA_EXECUTOR=deno OA_BASE_URL=https://dapi.openagenda.com/v3 \
//   OA_API_KEY=oa_pk_xxx [OA_AGENDA_UID=<uid>] node scripts/smoke.js
//
// It checks:
//   1. tools are listed (search_docs, execute)
//   2. execute runs code in the sandbox            → `return 1 + 1` === "2"
//   3. egress allowlist holds                       → fetch to a NON-allowed host errors
//   4. (optional) a real read hits the API          → events.list on OA_AGENDA_UID

import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const serverEntry = join(import.meta.dirname, '..', 'src', 'index.js');

let pass = 0;
let fail = 0;
const ok = (cond, msg, extra = '') => {
  if (cond) {
    pass += 1;
    console.log('✓', msg);
  } else {
    fail += 1;
    console.log('✗', msg, extra);
  }
};
const textOf = (r) => r?.content?.map((c) => c.text).join('\n') ?? '';

const transport = new StdioClientTransport({
  command: process.execPath, // this node
  args: [serverEntry],
  env: { ...process.env }, // forward PATH (for deno) + OA_*
});

const client = new Client({ name: 'oa-mcp-smoke', version: '0.0.0' });
await client.connect(transport);

try {
  // 1. tools
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();
  ok(
    names.includes('execute') && names.includes('search_docs'),
    `tools listed: ${names.join(', ')}`,
  );

  // 2. sandbox runs code
  const r2 = await client.callTool({
    name: 'execute',
    arguments: { code: 'return 1 + 1;' },
  });
  const runtimeWorks = !r2.isError && textOf(r2).trim() === '2';
  ok(runtimeWorks, 'execute runs in sandbox (1+1 === 2)', textOf(r2));

  // 3. egress allowlist: a fetch OUTSIDE the API host must be denied by the
  // sandbox. Only meaningful if the runtime actually ran — otherwise an error
  // here just means "runtime broken", not "egress blocked" (false positive).
  if (runtimeWorks) {
    const r3 = await client.callTool({
      name: 'execute',
      arguments: {
        code: 'return await fetch("https://example.com").then(r => r.status);',
      },
    });
    ok(
      r3.isError === true,
      'egress blocked: fetch to non-allowlisted host errors',
      r3.isError ? '' : `NOT blocked → ${textOf(r3)}`,
    );
  } else {
    console.log(
      '· skipped egress check (runtime not working — fix that first)',
    );
  }

  // 4. optional real read
  const uid = process.env.OA_AGENDA_UID;
  if (uid) {
    const r4 = await client.callTool({
      name: 'execute',
      arguments: {
        code: `const { data, error } = await oa.agendas.events.list({ path: { agendaUid: ${uid} }, query: { limit: 1 } }); if (error) throw new Error(JSON.stringify(error)); return { got: data.data.length, firstUid: data.data[0]?.uid ?? null };`,
      },
    });
    ok(
      !r4.isError,
      `real read: agendas.events.list(${uid}, {limit:1})`,
      textOf(r4),
    );
    console.log('   →', textOf(r4).replace(/\s+/g, ' ').slice(0, 200));
  } else {
    console.log(
      '· skipped real-read check (set OA_AGENDA_UID=<uid> to enable)',
    );
  }
} finally {
  await client.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
