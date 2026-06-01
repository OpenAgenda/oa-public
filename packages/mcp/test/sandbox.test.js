// Unit tests for the sandbox enforcement layer — the part that IS the security
// boundary (resource caps, egress policy shape, env isolation, process running)
// and was previously only exercised by scripts/smoke.js (needs deno/srt + net).
// These use Node itself as the child, so they run in CI with no extra binary.

import { runProcess } from '../src/sandbox/_spawn.js';
import { which, missingBinResult } from '../src/sandbox/_which.js';
import { sandboxEnv } from '../src/sandbox/_env.js';
import { buildDenoArgs } from '../src/sandbox/denoExecutor.js';
import { buildSrtSettings } from '../src/sandbox/srtExecutor.js';

const NODE = process.execPath;

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

describe('buildSrtSettings', () => {
  it('allows egress ONLY to the given hosts and permits no writes', () => {
    const s = buildSrtSettings(['api.openagenda.com']);
    expect(s.network.allowedDomains).toEqual(['api.openagenda.com']);
    expect(s.network.deniedDomains).toEqual([]);
    expect(s.filesystem.allowWrite).toEqual([]); // allow-only → nothing writable
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
