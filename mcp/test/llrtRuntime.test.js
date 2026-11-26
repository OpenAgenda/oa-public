// The generated SDK (ky client) run on the llrt runtime the µVM image bakes in.
// Node and deno are spec-conformant enough that the other suites never see a
// runtime gap; llrt is not, and a gap there only shows in production. Case in
// point: llrt < 0.9 exposed `Request.body` as a string, so ky's post-response
// cleanup (`request.body?.cancel()`) threw `TypeError: not a function` on every
// call carrying a body - after the request had reached the API.
//
// Needs an llrt binary: OA_LLRT_BIN, else `llrt` on PATH. Skipped without one;
// run it with the version llrt.Dockerfile pins before cutting a new image.

import { createServer } from 'node:http';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildScript } from '../src/sandbox/preamble.js';
import { runProcess } from '../src/sandbox/spawn.js';
import { which } from '../src/sandbox/which.js';

const LLRT = which(process.env.OA_LLRT_BIN || 'llrt');
const describeWithLlrt = LLRT ? describe : describe.skip;

describeWithLlrt('generated SDK on llrt', () => {
  let server;
  let baseUrl;
  let dir;

  beforeAll(async () => {
    // Echoes what it received, so a test asserts on what went over the wire.
    server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ method: req.method, url: req.url, body }));
      });
    });
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    dir = mkdtempSync(join(tmpdir(), 'oa-mcp-llrt-'));
  });

  afterAll(async () => {
    rmSync(dir, { recursive: true, force: true });
    await new Promise((resolve) => {
      server.close(resolve);
    });
  });

  // llrt has no stdin program mode: the program goes through a file, as in the µVM.
  const run = async (code) => {
    const file = join(dir, `${Math.random().toString(36).slice(2)}.mjs`);
    writeFileSync(file, buildScript(code, { baseUrl, apiKey: 'oa_pk_test' }));
    const r = await runProcess({
      cmd: LLRT,
      args: [file],
      input: '',
      timeoutMs: 10000,
    });
    expect(r.stderr).toBe('');
    return JSON.parse(r.stdout);
  };

  it('sends a request without a body', async () => {
    const r = await run(
      'const { data } = await oa.agendas.events.list({ path: { agendaUid: 1 }, throwOnError: true }); return data;',
    );
    expect(r).toEqual({ method: 'GET', url: '/agendas/1/events', body: '' });
  });

  it('sends a request with a JSON body and reads its response', async () => {
    const r = await run(
      "const { data } = await oa.agendas.events.create({ path: { agendaUid: 1 }, body: { title: { fr: 'x' } }, throwOnError: true }); return data;",
    );
    expect(r).toEqual({
      method: 'POST',
      url: '/agendas/1/events',
      body: '{"title":{"fr":"x"}}',
    });
  });
});
