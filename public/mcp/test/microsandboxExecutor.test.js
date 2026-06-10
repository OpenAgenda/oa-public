// Tests for the microsandbox engine — the hosted, multi-tenant µVM boundary.
//
// The pure pieces (the exact-host deny-by-default policy shape, the output cap)
// are tested hermetically with fakes — these run in CI with no
// KVM. The real µVM behaviour (boot, host-enforced egress, wall-clock kill) is
// covered by an integration block that SELF-SKIPS unless a virtualization host
// is present AND opt-in (OA_MSB_IT=1) — it boots libkrun µVMs and reaches the
// network, so it must never run in plain CI.

import { existsSync } from 'node:fs';
import {
  buildPolicy,
  capOutput,
  createMicrosandboxExecutor,
  execLlrt,
  execNode,
} from '../src/sandbox/executors/microsandboxExecutor.js';
import { createWarmPool } from '../src/sandbox/executors/microsandboxPool.js';
import { MAX_OUTPUT_BYTES } from '../src/sandbox/spawn.js';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('buildPolicy', () => {
  // Fakes record what the adapter asks the SDK to build, without a real µVM.
  const Destination = {
    domain: (domain) => ({ kind: 'domain', domain }),
  };
  const Rule = {
    allowDns: () => ({ kind: 'dns' }),
    allowEgress: (dest) => ({ kind: 'egress', dest }),
  };

  it('is deny-by-default in both directions', () => {
    const p = buildPolicy({ Rule, Destination }, ['api.openagenda.com']);
    expect(p.defaultEgress).toBe('deny');
    expect(p.defaultIngress).toBe('deny');
  });

  it('allows DNS first, then an exact-host egress rule per host', () => {
    const p = buildPolicy({ Rule, Destination }, ['api.openagenda.com']);
    expect(p.rules[0]).toEqual({ kind: 'dns' });
    expect(p.rules[1]).toEqual({
      kind: 'egress',
      dest: { kind: 'domain', domain: 'api.openagenda.com' },
    });
  });

  it('emits one exact-host egress rule per allowed host', () => {
    const p = buildPolicy({ Rule, Destination }, [
      'api.openagenda.com',
      'cdn.example.org',
    ]);
    const domains = p.rules
      .filter((r) => r.kind === 'egress')
      .map((r) => r.dest.domain);
    expect(domains).toEqual(['api.openagenda.com', 'cdn.example.org']);
  });
});

describe('capOutput', () => {
  it('passes short output through unchanged', () => {
    expect(capOutput('hi')).toEqual({ stdout: 'hi', outputCapped: false });
  });

  it('truncates output beyond 1 MiB and flags it', () => {
    const r = capOutput('x'.repeat(MAX_OUTPUT_BYTES + 1024));
    expect(r.outputCapped).toBe(true);
    expect(Buffer.byteLength(r.stdout, 'utf8')).toBeLessThanOrEqual(
      MAX_OUTPUT_BYTES + 64,
    );
    expect(r.stdout).toContain('[killed: output exceeded 1 MiB]');
  });
});

// A fake sandbox recording fs().write + the execWith builder calls — no µVM, no
// SDK. Mirrors the package's hand-rolled-stub style (cf. log.test.js).
function fakeSandbox() {
  const writes = [];
  const builder = { calls: {} };
  builder.args = (a) => {
    builder.calls.args = a;
    return builder;
  };
  builder.stdinBytes = (b) => {
    builder.calls.stdin = b;
    return builder;
  };
  builder.timeout = (t) => {
    builder.calls.timeout = t;
    return builder;
  };
  builder.envs = (e) => {
    builder.calls.envs = e;
    return builder;
  };
  const exec = {};
  const sb = {
    fs: () => ({
      write: async (path, buf) => {
        writes.push({ path, buf });
      },
    }),
    execWith: (cmd, configure) => {
      exec.cmd = cmd;
      configure(builder);
      return { stdout: () => 'OUT', stderr: () => '', code: 0 };
    },
  };
  return { sb, writes, exec, builder };
}

describe('execNode', () => {
  it('runs `node` reading the ESM program on stdin (no file written)', async () => {
    const { sb, writes, exec, builder } = fakeSandbox();
    await execNode(sb, 'console.log(1)', {}, 4321);
    expect(exec.cmd).toBe('node');
    expect(builder.calls.args).toEqual(['--input-type=module']);
    expect(builder.calls.stdin).toEqual(Buffer.from('console.log(1)', 'utf8'));
    expect(builder.calls.timeout).toBe(4321);
    expect(writes).toHaveLength(0);
    expect(builder.calls.envs).toBeUndefined(); // empty env → no envs() call
  });

  it('passes a non-empty env through', async () => {
    const { sb, builder } = fakeSandbox();
    await execNode(sb, 'x', { FOO: 'bar' }, 1000);
    expect(builder.calls.envs).toEqual({ FOO: 'bar' });
  });
});

describe('execLlrt', () => {
  it('writes the program into the guest and runs it as a FILE with the given command', async () => {
    const { sb, writes, exec, builder } = fakeSandbox();
    await execLlrt(sb, 'export const x = 1', {}, 9999, null, '/oa/llrt');
    // program written to the guest (never a mount — it carries the scoped token)
    expect(writes).toHaveLength(1);
    expect(writes[0].buf).toEqual(Buffer.from('export const x = 1', 'utf8'));
    // executed as that exact file, via the provided binary path
    expect(exec.cmd).toBe('/oa/llrt');
    expect(builder.calls.args).toEqual([writes[0].path]);
    expect(builder.calls.timeout).toBe(9999);
    expect(builder.calls.stdin).toBeUndefined(); // llrt has no stdin program mode
  });

  it('uses `llrt` on PATH when given that command (baked image, no bind-mount)', async () => {
    const { sb, exec } = fakeSandbox();
    await execLlrt(sb, 'x', {}, 1000, null, 'llrt');
    expect(exec.cmd).toBe('llrt');
  });

  it('sets LLRT_EXTRA_CA_CERTS only when a dev CA is mounted', async () => {
    const withCa = fakeSandbox();
    await execLlrt(withCa.sb, 'x', {}, 1000, '/host/ca.pem', '/oa/llrt');
    expect(withCa.builder.calls.envs).toMatchObject({
      LLRT_EXTRA_CA_CERTS: expect.any(String),
    });

    const noCa = fakeSandbox();
    await execLlrt(noCa.sb, 'x', {}, 1000, null, '/oa/llrt');
    expect(noCa.builder.calls.envs).toBeUndefined(); // no CA + empty env → no envs()
  });

  it('merges the dev CA env with a caller-provided env', async () => {
    const { sb, builder } = fakeSandbox();
    await execLlrt(sb, 'x', { FOO: 'bar' }, 1000, '/host/ca.pem', 'llrt');
    expect(builder.calls.envs).toMatchObject({
      FOO: 'bar',
      LLRT_EXTRA_CA_CERTS: expect.any(String),
    });
  });
});

describe('createWarmPool', () => {
  // Fake spare factory: hands out numbered objects, records destroys. No µVM.
  function fakeFactory() {
    let n = 0;
    const destroyed = [];
    return {
      create: async () => {
        n += 1;
        return { id: n };
      },
      destroy: (spare) => {
        destroyed.push(spare.id);
      },
      destroyed,
    };
  }

  it('pre-warms up to size, then serves an acquire as a hit and refills', async () => {
    const f = fakeFactory();
    const pool = createWarmPool({
      size: 2,
      create: f.create,
      destroy: f.destroy,
    });
    pool.refill();
    await flush();
    expect(pool.idleCount).toBe(2);

    const spare = await pool.acquire();
    expect(spare).toBeTruthy();
    expect(pool.stats.hits).toBe(1);
    await flush();
    expect(pool.idleCount).toBe(2); // topped back up
  });

  it('counts a miss and creates inline when no spare is ready', async () => {
    const f = fakeFactory();
    const pool = createWarmPool({
      size: 1,
      create: f.create,
      destroy: f.destroy,
    });
    const spare = await pool.acquire(); // idle empty → miss
    expect(spare).toBeTruthy();
    expect(pool.stats.misses).toBe(1);
    expect(pool.stats.hits).toBe(0);
  });

  it('never keeps more than size idle spares', async () => {
    const f = fakeFactory();
    const pool = createWarmPool({
      size: 3,
      create: f.create,
      destroy: f.destroy,
    });
    pool.refill();
    pool.refill(); // double-call must not over-warm
    await flush();
    expect(pool.idleCount).toBe(3);
  });

  it('drain destroys idle spares and stops further refilling', async () => {
    const f = fakeFactory();
    const pool = createWarmPool({
      size: 2,
      create: f.create,
      destroy: f.destroy,
    });
    pool.refill();
    await flush();
    await pool.drain();
    expect(f.destroyed.sort()).toEqual([1, 2]);
    expect(pool.idleCount).toBe(0);
    pool.refill();
    await flush();
    expect(pool.idleCount).toBe(0); // draining → no new spares
  });

  it('survives a failing create: counts it, stays usable', async () => {
    let calls = 0;
    const create = async () => {
      calls += 1;
      throw new Error('boom');
    };
    const pool = createWarmPool({
      size: 2,
      create,
      destroy: () => {},
      onError: () => {},
    });
    pool.refill();
    await flush();
    expect(pool.stats.failed).toBeGreaterThan(0);
    expect(pool.idleCount).toBe(0);
    await expect(pool.acquire()).rejects.toThrow('boom'); // miss → inline create throws
    expect(calls).toBeGreaterThan(0);
  });

  it('drain awaits an in-flight create and tears down the spare it produces', async () => {
    const destroyed = [];
    let release;
    // A create that hangs until released — so it is STILL in flight when drain() runs.
    const create = () =>
      new Promise((resolve) => {
        release = () => resolve({ id: 1 });
      });
    const pool = createWarmPool({
      size: 1,
      create,
      destroy: (s) => {
        destroyed.push(s.id);
      },
    });
    pool.refill();
    await flush(); // create is now pending (in flight), nothing idle yet
    expect(pool.idleCount).toBe(0);

    const drained = pool.drain(); // start draining while the create is still pending
    release(); // the spare finishes booting AFTER drain() began
    await drained; // drain must await that in-flight create's self-destroy

    expect(destroyed).toEqual([1]); // booted spare was torn down, not orphaned
    expect(pool.idleCount).toBe(0);
  });

  it('retires a spare past maxAgeMs and serves a fresh one (never a near-expired µVM)', async () => {
    const f = fakeFactory();
    let clock = 1000;
    const pool = createWarmPool({
      size: 1,
      create: f.create,
      destroy: f.destroy,
      maxAgeMs: 5000,
      now: () => clock,
    });
    pool.refill();
    await flush();
    expect(pool.idleCount).toBe(1); // spare #1 warmed at t=1000

    clock += 5001; // spare #1 is now older than maxAgeMs → unsafe to serve
    const spare = await pool.acquire();
    expect(spare.id).toBe(2); // #1 retired, a fresh #2 served as a miss
    expect(f.destroyed).toContain(1); // the aged-out spare was torn down
    expect(pool.stats.expired).toBe(1);
    expect(pool.stats.misses).toBe(1);
  });

  it('serves a spare still within maxAgeMs as a hit', async () => {
    const f = fakeFactory();
    let clock = 1000;
    const pool = createWarmPool({
      size: 1,
      create: f.create,
      destroy: f.destroy,
      maxAgeMs: 5000,
      now: () => clock,
    });
    pool.refill();
    await flush();

    clock += 4999; // still within budget
    const spare = await pool.acquire();
    expect(spare.id).toBe(1); // the warm spare is served
    expect(pool.stats.hits).toBe(1);
    expect(pool.stats.expired).toBe(0);
  });
});

// ── Integration: real µVM. Opt-in + KVM-gated; never runs in plain CI. ──
const CAN_RUN_MSB = process.env.OA_MSB_IT === '1' && existsSync('/dev/kvm');
const describeMsb = CAN_RUN_MSB ? describe : describe.skip;

describeMsb('microsandbox executor (integration — boots a real µVM)', () => {
  const exec = createMicrosandboxExecutor();
  const base = {
    env: {},
    allowNet: ['api.openagenda.com'],
    egressAuthority: 'executor',
    tls: { useSystemCa: false, extraCaCerts: null },
  };

  it('runs a trivial program and captures stdout + exit 0', async () => {
    const r = await exec.run({
      ...base,
      code: 'process.stdout.write("ok:" + process.version)',
      limits: { timeoutMs: 20000, memoryMb: 1024 },
    });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(/^ok:v\d/);
    expect(r.timedOut).toBe(false);
  }, 120000);

  it('enforces egress: the API host is reachable, others are not', async () => {
    const r = await exec.run({
      ...base,
      code: `const out = [];
        try { const a = await fetch("https://api.openagenda.com/v3/agendas?size=1"); out.push("api=" + a.status); }
        catch { out.push("api=ERR"); }
        try { await fetch("https://example.com/"); out.push("example=LEAK"); }
        catch { out.push("example=blocked"); }
        process.stdout.write(out.join(" "));`,
      limits: { timeoutMs: 30000, memoryMb: 1024 },
    });
    expect(r.stdout).toContain('api=200');
    expect(r.stdout).toContain('example=blocked');
  }, 120000);

  it('kills a run that exceeds the wall-clock limit', async () => {
    const r = await exec.run({
      ...base,
      code: 'setInterval(() => {}, 1000); await new Promise(() => {});',
      limits: { timeoutMs: 3000, memoryMb: 1024 },
    });
    expect(r.timedOut).toBe(true);
    expect(r.exitCode).toBeNull();
  }, 120000);

  it('pooled: serves concurrent runs correctly AND a warm spare still enforces egress', async () => {
    const limits = { timeoutMs: 30000, memoryMb: 1024 };
    const pooled = createMicrosandboxExecutor({
      poolSize: 3,
      allowNet: base.allowNet,
      limits,
    });
    try {
      await new Promise((r) => setTimeout(r, 4000)); // let spares warm
      // Concurrent runs: each must get its own µVM and the right output.
      const results = await Promise.all(
        [0, 1, 2].map((i) =>
          pooled.run({
            ...base,
            limits,
            code: `process.stdout.write("r${i}")`,
          })),
      );
      results.forEach((r, i) => {
        expect(r.exitCode).toBe(0);
        expect(r.stdout).toBe(`r${i}`);
      });
      // The security-critical property: a POOLED (pre-created) spare carries the
      // baked egress policy — the API host is reachable, everything else is not.
      const egress = await pooled.run({
        ...base,
        limits,
        code: `let o = "";
          try { const a = await fetch("https://api.openagenda.com/v3/agendas?size=1"); o += "api=" + a.status; }
          catch { o += "api=ERR"; }
          try { await fetch("https://example.com/"); o += " example=LEAK"; }
          catch { o += " example=blocked"; }
          process.stdout.write(o);`,
      });
      expect(egress.stdout).toContain('api=200');
      expect(egress.stdout).toContain('example=blocked');
    } finally {
      await pooled.dispose?.();
    }
  }, 120000);
});
