// Unit tests for the sandbox enforcement layer — the part that IS the security
// boundary (resource caps, env isolation, process running) and was previously
// only exercised by scripts/smoke.js (needs deno/node + net). These use Node
// itself as the child, so they run in CI with no extra binary.

import { runProcess } from '../src/sandbox/spawn.js';
import { which, missingBinResult } from '../src/sandbox/which.js';
import { sandboxEnv } from '../src/sandbox/env.js';
import { buildDenoArgs } from '../src/sandbox/executors/denoExecutor.js';
import {
  buildNodeFlags,
  createNodeExecutor,
} from '../src/sandbox/executors/nodeExecutor.js';

const NODE = process.execPath;
const NODE_MAJOR = Number(process.versions.node.split('.')[0]);

describe('buildNodeFlags', () => {
  const limits = { memoryMb: 256 };

  it('applies the permission sandbox by default flags + heap cap + stdin program', () => {
    const flags = buildNodeFlags({ limits, permission: true, nodeMajor: 24 });
    expect(flags).toContain('--permission');
    expect(flags).not.toContain('--allow-net'); // not a Node 24 flag
    expect(flags).toContain('--max-old-space-size=256');
    expect(flags).toContain('--input-type=module');
  });

  it('grants --allow-net from Node 25 (network moved behind the permission model)', () => {
    const flags = buildNodeFlags({ limits, permission: true, nodeMajor: 25 });
    expect(flags).toContain('--permission');
    expect(flags).toContain('--allow-net');
  });

  it('bare node (OA_LOCAL_NO_SANDBOX) carries no permission flags', () => {
    const flags = buildNodeFlags({ limits, permission: false, nodeMajor: 25 });
    expect(flags).not.toContain('--permission');
    expect(flags).not.toContain('--allow-net');
  });

  it('adds --use-system-ca for the dev CA', () => {
    const flags = buildNodeFlags({ limits, useSystemCa: true, nodeMajor: 24 });
    expect(flags[0]).toBe('--use-system-ca');
  });
});

// The child is this very node — these run wherever node >= 24 runs (the
// engines floor), so gate the whole block instead of failing on an older CI runtime.
const describeOnNode24 = NODE_MAJOR >= 24 ? describe : describe.skip;

describeOnNode24('createNodeExecutor (permission sandbox)', () => {
  it('denies filesystem reads to the executed code', async () => {
    const r = await createNodeExecutor({ permission: true }).run({
      code:
        'try { (await import("node:fs")).readFileSync("/etc/hostname"); console.log("read-ok"); }'
        + ' catch (e) { console.log("code:" + e.code); }',
      limits: { timeoutMs: 5000, memoryMb: 128 },
      env: {},
    });
    expect(r.stdout).toContain('code:ERR_ACCESS_DENIED');
  });

  it('denies subprocess spawning to the executed code', async () => {
    const r = await createNodeExecutor({ permission: true }).run({
      code:
        'try { (await import("node:child_process")).execSync("id"); console.log("spawn-ok"); }'
        + ' catch (e) { console.log("code:" + e.code); }',
      limits: { timeoutMs: 5000, memoryMb: 128 },
      env: {},
    });
    expect(r.stdout).toContain('code:ERR_ACCESS_DENIED');
  });

  it('bare node (permission: false) keeps fs readable — the opt-out path', async () => {
    const r = await createNodeExecutor({ permission: false }).run({
      code: '(await import("node:fs")).statSync("/"); console.log("fs-ok");',
      limits: { timeoutMs: 5000, memoryMb: 128 },
      env: {},
    });
    expect(r.stdout).toContain('fs-ok');
  });
});

describe('buildDenoArgs', () => {
  it('is deny-by-default: run, net flag, --no-prompt, heap cap, program via stdin', () => {
    const args = buildDenoArgs('--allow-net=api.openagenda.com', {
      memoryMb: 256,
    });
    expect(args[0]).toBe('run');
    expect(args).toContain('--allow-net=api.openagenda.com');
    expect(args).toContain('--no-prompt'); // never block on a permission prompt
    expect(args).toContain('--v8-flags=--max-old-space-size=256');
    expect(args[args.length - 1]).toBe('-'); // stdin → no temp file on disk
  });

  it('injects extra flags (e.g. a --cert dev CA)', () => {
    const args = buildDenoArgs('--allow-net=h', { memoryMb: 128 }, [
      '--cert=/ca.pem',
    ]);
    expect(args).toContain('--cert=/ca.pem');
  });
});

describe('sandboxEnv', () => {
  it('passes through only operational vars, never operator secrets', () => {
    const env = sandboxEnv(
      {},
      {
        PATH: '/usr/bin',
        HOME: '/home/x',
        LANG: 'en_US.UTF-8',
        OA_API_KEY: 'oa_pk_secret',
        AWS_SECRET_ACCESS_KEY: 'nope',
        MY_TOKEN: 'nope',
      },
    );
    expect(env.PATH).toBe('/usr/bin');
    expect(env.HOME).toBe('/home/x');
    expect(env.LANG).toBe('en_US.UTF-8');
    expect(env).not.toHaveProperty('OA_API_KEY');
    expect(env).not.toHaveProperty('AWS_SECRET_ACCESS_KEY');
    expect(env).not.toHaveProperty('MY_TOKEN');
  });

  it('passes the outer-wrapper proxy vars through (egress under srt on macOS)', () => {
    const env = sandboxEnv(
      {},
      {
        PATH: '/b',
        HTTP_PROXY: 'http://127.0.0.1:9',
        HTTPS_PROXY: 'http://127.0.0.1:9',
      },
    );
    expect(env.HTTP_PROXY).toBe('http://127.0.0.1:9');
    expect(env.HTTPS_PROXY).toBe('http://127.0.0.1:9');
  });

  it('adds explicit extra assignments on top', () => {
    const env = sandboxEnv(
      { DENO_TLS_CA_STORE: 'system,mozilla' },
      { PATH: '/b' },
    );
    expect(env.DENO_TLS_CA_STORE).toBe('system,mozilla');
    expect(env.PATH).toBe('/b');
  });

  it('omits allowlisted vars absent from the base', () => {
    const env = sandboxEnv({}, { PATH: '/b' });
    expect(env).not.toHaveProperty('HOME');
  });
});

describe('which / missingBinResult', () => {
  it('resolves an absolute path that exists, null otherwise', () => {
    expect(which(NODE)).toBe(NODE);
    expect(which('/no/such/binary-xyz')).toBeNull();
  });

  it('missingBinResult is a well-formed failure ExecResult', () => {
    const r = missingBinResult('deno', 'Install it.');
    expect(r).toMatchObject({ stdout: '', timedOut: false, exitCode: null });
    expect(r.stderr).toContain('deno not found');
    expect(r.stderr).toContain('Install it.');
  });
});

describe('runProcess', () => {
  const base = { timeoutMs: 3000 };

  it('captures stdout and a zero exit on success', async () => {
    const r = await runProcess({
      cmd: NODE,
      args: ['-e', 'process.stdout.write("hi")'],
      input: '',
      ...base,
    });
    expect(r.stdout).toBe('hi');
    expect(r.exitCode).toBe(0);
    expect(r.timedOut).toBe(false);
  });

  it('reads the program from stdin', async () => {
    const r = await runProcess({
      cmd: NODE,
      args: ['--input-type=module'],
      input: 'process.stdout.write("from-stdin")',
      ...base,
    });
    expect(r.stdout).toBe('from-stdin');
    expect(r.exitCode).toBe(0);
  });

  it('reports a non-zero exit code', async () => {
    const r = await runProcess({
      cmd: NODE,
      args: ['-e', 'process.exit(3)'],
      input: '',
      ...base,
    });
    expect(r.exitCode).toBe(3);
  });

  it('kills and flags a run that exceeds the wall-clock limit', async () => {
    const r = await runProcess({
      cmd: NODE,
      args: ['-e', 'setInterval(() => {}, 1000)'],
      input: '',
      timeoutMs: 300,
    });
    expect(r.timedOut).toBe(true);
  });

  it('flags an output-cap kill when stdout exceeds 1 MiB', async () => {
    const r = await runProcess({
      cmd: NODE,
      args: ['-e', 'process.stdout.write("x".repeat(2 * 1024 * 1024))'],
      input: '',
      ...base,
    });
    expect(r.outputCapped).toBe(true);
  });

  it('resolves (never rejects) with a null exit on a spawn error', async () => {
    const r = await runProcess({
      cmd: '/no/such/binary-xyz',
      args: [],
      input: '',
      ...base,
    });
    expect(r.exitCode).toBeNull();
    expect(r.stderr).toMatch(/ENOENT|spawn/i);
  });

  it('runs with the explicit env it is given — operator secrets do not leak in', async () => {
    const r = await runProcess({
      cmd: NODE,
      args: ['-e', 'process.stdout.write(String(process.env.OA_API_KEY))'],
      input: '',
      env: sandboxEnv({}, { PATH: process.env.PATH, OA_API_KEY: 'oa_pk_leak' }),
      ...base,
    });
    expect(r.stdout).toBe('undefined'); // stripped by sandboxEnv before spawn
  });
});
