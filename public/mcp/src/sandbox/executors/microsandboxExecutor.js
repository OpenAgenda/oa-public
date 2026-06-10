// `microsandbox` engine — the HOSTED, multi-tenant hard boundary.
//
// One microVM (libkrun + KVM) per execution: its own kernel, host-enforced
// egress, hard CPU/RAM caps. This is the ONLY engine config.js permits for the
// public, multi-tenant surface (OA_MCP_MODE=hosted) — node/deno give a process
// boundary, not kernel isolation, so a runtime 0-day would land on the host.
//
// Requires a virtualization host: Linux + /dev/kvm, or macOS Apple Silicon. The
// `microsandbox` npm package is an OPTIONAL dependency (it ships a ~70 MiB native
// libkrun prebuild) and is imported LAZILY, so the zero-install local deno/node
// path never pays for it; on a host without it, run() returns a clear failure
// rather than crashing the server.
//
// Boundary mapping — verified against microsandbox 0.5.x (docs.microsandbox.dev,
// and the package's own .d.ts):
//   - egress  → a NetworkPolicy: defaultDeny + allow DNS + allow each API host
//               EXACTLY (matched on TLS SNI; see buildPolicy). Host-enforced
//               (every packet is checked before it leaves the µVM), so — unlike
//               node — this engine genuinely OWNS egress; config.js requires
//               egressAuthority=executor.
//   - memory  → .memory(MiB(memoryMb)): a hard µVM RAM cap. Stronger than a V8
//               heap flag (the whole guest is bounded), so we do NOT also pass
//               --max-old-space-size. NOTE: a µVM running node needs real
//               headroom — set OA_SANDBOX_MEMORY_MB well above a bare-process value.
//   - time    → exec .timeout(ms) is the per-run kill (throws ExecTimeoutError);
//               .maxDuration(secs) is a whole-µVM lifetime backstop.
//   - output  → capped post-hoc to the same 1 MiB as the spawn-based engines.
//
// STILL ours (the µVM is isolation, not the whole policy): a scoped per-caller
// OAuth token with NO ambient credential, a per-token rate-limit, an audit log,
// version pinning (beta), and tenant authn. (The concurrency cap that bounds host
// RAM is now in place — concurrencyLimit.js wraps this engine.) See
// docs/microsandbox.md.

import { randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { MAX_OUTPUT_BYTES } from '../spawn.js';
import { DEFAULT_MICROSANDBOX_IMAGE } from '../../config.js';
import { log } from '../../log.js';
import { recordUvmStats } from '../../telemetry.js';
import { createWarmPool } from './microsandboxPool.js';

const SANDBOX_PREFIX = 'oa-mcp-exec'; // a UNIQUE name per run is appended (see below)

// Guest paths for the `llrt` runtime (config.sandboxRuntime === 'llrt').
//   - the static llrt binary, bind-mounted read-only (no per-request data, so it
//     is baked into the µVM / pooled spares; the per-run program is NOT — see run()).
//   - the optional dev CA (OADEV private root), bind-mounted read-only and pointed
//     at via LLRT_EXTRA_CA_CERTS at exec time (prod uses public CAs → no mount).
//   - the per-request program, written into the guest with sb.fs().write at run
//     time (it carries the caller's baked token, so it must NOT be a static mount,
//     and llrt has no stdin program mode — it runs a FILE).
const GUEST_LLRT = '/oa/llrt';
const GUEST_CA = '/oa/ca.pem';
const GUEST_PROGRAM = '/tmp/oa-program.js';

// A µVM's HARD lifetime (maxDuration), a coarse backstop independent of the
// per-run kill (.timeout at execWith). Deliberately a CONSTANT, NOT derived from
// the per-run timeout: a warm pooled spare ages against this clock while idle, and
// the pool only serves a spare whose remaining life still covers a full run (see
// SPARE_LIFETIME_MARGIN_MS + the pool's maxAgeMs). 5 min is ample for a warm spare
// to wait, while still reaping a truly wedged/orphaned µVM.
const SANDBOX_LIFETIME_S = 300;
// Remaining-life a pooled spare must have to be served: one full run plus slack for
// acquire→exec handoff + teardown. acquire() retires any spare with less. Keeps the
// LIFETIME INVARIANT (no spare ever expires mid-run) for any traffic pattern.
const SPARE_LIFETIME_MARGIN_MS = 30_000;

let modulePromise;
// Lazy, cached import of the optional native package. Resolves to the module, or
// null when it (or its platform prebuild) is absent — never throws at import.
function loadMicrosandbox() {
  if (!modulePromise) {
    modulePromise = import('microsandbox').then(
      (m) => m,
      () => null,
    );
  }
  return modulePromise;
}

// Deny-by-default egress: allow DNS, then each API host EXACTLY. The match is on
// the TLS SNI (the requested hostname — not the resolved IP, nor the cert which
// TLS 1.3 encrypts). Pin the exact host, NOT a `domainSuffix` parent: the suffix
// would also admit sibling subdomains (a possible internal/private-IP SSRF
// target). No metadata/RFC1918/loopback deny rules are needed — under defaultDeny
// those have no matching SNI and are already dropped (a deny would only bite on a
// DNS-rebinding of the API host, outside this sandbox's threat model).
export function buildPolicy({ Rule, Destination }, allowNet) {
  return {
    defaultEgress: 'deny',
    defaultIngress: 'deny',
    rules: [
      Rule.allowDns(),
      ...allowNet.map((host) => Rule.allowEgress(Destination.domain(host))),
    ],
  };
}

// Cap stdout to MAX_OUTPUT_BYTES (parity with the spawn-based engines, which kill
// a runaway mid-stream; here the µVM already bounds it, so we truncate the result).
export function capOutput(text) {
  const buf = Buffer.from(text, 'utf8');
  if (buf.length <= MAX_OUTPUT_BYTES) return { stdout: text, outputCapped: false };
  return {
    stdout: `${buf.subarray(0, MAX_OUTPUT_BYTES).toString('utf8')}\n[killed: output exceeded 1 MiB]`,
    outputCapped: true,
  };
}

function failure(stderr) {
  return { stdout: '', stderr, timedOut: false, exitCode: null };
}

function errMsg(err) {
  return err instanceof Error ? err.message : String(err);
}

// Identify a microsandbox error by its stable string code, not `instanceof`:
// a code check survives module-realm boundaries (e.g. jest's VM-module loader)
// where instanceof against the imported class can be false.
/** @param {*} err @param {string} code */
function hasCode(err, code) {
  return Boolean(err) && typeof err === 'object' && err.code === code;
}

// Did the exec hit its wall-clock timeout? Primary signal is the stable error
// code 'execTimeout'. The message fallback exists because jest's VM-module loader
// runs the test in a realm where the JS-layer error mapping (which sets the code)
// does not apply and only the raw "[ExecTimeout] … timed out" message survives;
// we key on the "ExecTimeout" marker (NOT a bare "timed out", which would also
// catch unrelated infra errors and mislabel them as a wall-clock kill — a
// security-relevant lie). Only microsandbox's own rejection reaches here.
function isExecTimeout(err) {
  return hasCode(err, 'execTimeout') || /exectimeout/i.test(errMsg(err));
}

// Boot one fresh, uniquely-named µVM with the given create-time config. Used by
// BOTH the per-run fresh path and the pool's spare factory, so a pooled spare is
// bit-for-bit the same as a fresh one — only WHEN it was created differs.
//
// maxDuration is a CONSTANT whole-µVM lifetime backstop (SANDBOX_LIFETIME_S), NOT
// derived from the per-run timeout. The per-run kill is `.timeout(reqLimits.timeoutMs)`
// at execWith; this only reaps a wedged/orphaned µVM. Decoupling it is what lets a
// warm pooled spare wait without its lifetime being a few seconds — and the pool's
// acquire-time age guard (maxAgeMs) guarantees a spare is never served with less
// remaining life than a full run, so no run ever starts on a µVM that can expire
// mid-flight, at any traffic level. Because maxDuration no longer depends on the
// per-run timeout, that timeout is NOT part of a spare's baked identity (see sigKey).
function buildSandbox(
  msb,
  { image, memoryMb, policy, runtime, llrtBin, caCertHost },
) {
  const { Sandbox, MiB } = msb;
  let b = Sandbox.builder(`${SANDBOX_PREFIX}-${randomUUID()}`)
    .image(image)
    .cpus(1)
    .memory(MiB(memoryMb))
    .maxDuration(SANDBOX_LIFETIME_S)
    .network((n) => n.policy(policy));
  // llrt runtime, read-only request-independent mounts (a pooled spare bakes them
  // once; the per-run program is written later via fs(), never mounted — it holds
  // the scoped token). The binary is mounted ONLY when llrtBin is set (loose binary,
  // for local iteration); with a baked image (OA_LLRT_BIN unset) llrt is on PATH, no
  // mount. The dev CA is mounted whenever present, independent of the binary source.
  if (runtime === 'llrt') {
    if (llrtBin) b = b.volume(GUEST_LLRT, (m) => m.bind(llrtBin).readonly());
    if (caCertHost) b = b.volume(GUEST_CA, (m) => m.bind(caCertHost).readonly());
  }
  return b.create();
}

// Fully tear a µVM down: stop() halts it, removePersisted() drops it from the
// runtime DB so unique-named one-shots don't accumulate. Both best-effort.
async function destroySandbox(sb) {
  await sb.stop().catch(() => {});
  await sb.removePersisted().catch(() => {});
}

// _SC_CLK_TCK — the kernel's clock-tick rate that /proc/<pid>/stat utime+stime are
// counted in. 100 Hz on effectively all Linux builds (CONFIG_HZ); not queryable from
// pure Node, so a constant. A wrong value would only scale cpu_seconds, never break a run.
const CLOCK_TICK_HZ = 100;

// Host-side resource stats of the libkrun VMM process backing a µVM, read from /proc:
// VmHWM (peak RSS — monotone) and utime+stime (cumulative CPU). Both survive the
// in-guest workload process exit (the VMM is alive at teardown) and, being monotone /
// cumulative, capture even a sub-150ms run — unlike sb.metrics(), a 1s shared-memory
// sample whose memory reads the idle floor and whose CPU reads 0 for our short runs.
// The VMM is found by the unique sandbox name microsandbox passes as `--name <name>`
// in its cmdline. Returns { hwmBytes, cpuSeconds } (each null if that field can't be
// read), or null (no VMM found / no /proc on non-Linux). Never throws.
//
// ASYNC on purpose: this scans /proc once per run (the run's `finally`), so doing it
// with the sync fs API would block the single Node event loop on O(processes) reads
// while up to OA_MAX_CONCURRENCY runs are in flight — telemetry must not stall the
// hot path. The async fs API yields between reads instead.
async function readVmmStats(name) {
  let pids;
  try {
    pids = await readdir('/proc');
  } catch {
    return null; // no /proc (non-Linux host) — metrics simply absent
  }
  for (const pid of pids) {
    if (!/^\d+$/.test(pid)) continue;
    let cmdline;
    try {
      cmdline = await readFile(`/proc/${pid}/cmdline`);
    } catch {
      continue; // process vanished mid-scan
    }
    if (!cmdline.includes(name)) continue;
    /** @type {{hwmBytes: number|null, cpuSeconds: number|null}} */
    const stats = { hwmBytes: null, cpuSeconds: null };
    try {
      const status = await readFile(`/proc/${pid}/status`, 'utf8');
      const m = /VmHWM:\s+(\d+)\s+kB/.exec(status);
      if (m) stats.hwmBytes = Number(m[1]) * 1024;
    } catch {
      // VmHWM unreadable (teardown race) — leave null
    }
    try {
      // /proc/<pid>/stat: utime (field 14) + stime (field 15), in clock ticks. comm
      // (field 2) can contain spaces/parens, so parse the fields AFTER the final ')'.
      const stat = await readFile(`/proc/${pid}/stat`, 'utf8');
      const after = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
      const utime = Number(after[11]);
      const stime = Number(after[12]);
      if (Number.isFinite(utime) && Number.isFinite(stime)) {
        stats.cpuSeconds = (utime + stime) / CLOCK_TICK_HZ;
      }
    } catch {
      // stat unreadable (teardown race) — leave null
    }
    return stats;
  }
  return null;
}

// Run the program on `node` inside the µVM: feed the ESM source on stdin (no file,
// no node_modules). Returns the microsandbox exec output ({ stdout(), stderr(), code }).
// Exported for hermetic unit tests (fed a fake sb); see microsandboxExecutor.test.js.
export function execNode(sb, code, reqEnv, timeoutMs) {
  return sb.execWith('node', (b) => {
    const configured = b
      .args(['--input-type=module']) // read the ESM program from stdin
      .stdinBytes(Buffer.from(code, 'utf8'))
      .timeout(timeoutMs);
    return reqEnv && Object.keys(reqEnv).length
      ? configured.envs(reqEnv)
      : configured;
  });
}

// Run the program on `llrt` inside the µVM. llrt has NO stdin program mode (it runs
// a FILE), so the source is written into the guest tmpfs per-run via fs().write —
// never a static mount, because it carries the caller's scoped token (and the µVM is
// single-use). `cmd` is the bind-mount path (GUEST_LLRT) for a loose binary, or just
// `llrt` (on PATH) for a baked image. The dev CA, when mounted, is trusted via
// LLRT_EXTRA_CA_CERTS. Exported for hermetic unit tests (fed a fake sb).
export async function execLlrt(sb, code, reqEnv, timeoutMs, caCertHost, cmd) {
  await sb.fs().write(GUEST_PROGRAM, Buffer.from(code, 'utf8'));
  const env = caCertHost
    ? { ...reqEnv, LLRT_EXTRA_CA_CERTS: GUEST_CA }
    : reqEnv;
  return sb.execWith(cmd, (b) => {
    const configured = b.args([GUEST_PROGRAM]).timeout(timeoutMs);
    return env && Object.keys(env).length ? configured.envs(env) : configured;
  });
}

// Identity of a spare's BAKED create-time config. A pooled spare may only serve a
// request with the same key — otherwise its frozen egress policy / RAM cap would be
// the wrong boundary. The per-run timeout and env are applied at EXEC, not baked
// (maxDuration is now a constant, not derived from the timeout), so neither is part
// of the key — a spare serves any per-run timeout.
//
// runtime / llrtBin / caCertHost are ALSO baked into a spare but are deliberately
// NOT in the key: they are process-constant (one executor config per process), so
// every spare and every request share them. If any ever becomes per-request, it
// MUST be added here, or a spare baked with the wrong runtime/binary/CA mount could
// be served to a mismatched request.
function sigKey({ memoryMb, allowNet }) {
  return JSON.stringify({
    memoryMb,
    allowNet: [...allowNet].sort(),
  });
}

/**
 * @param {object} [opts]
 * @param {string}  [opts.image]     OCI image for the µVM runtime (config.microsandboxImage).
 * @param {number}  [opts.poolSize]  Warm single-use µVM spares to keep ready (0 = off / ephemeral).
 * @param {string[]} [opts.allowNet] Egress allowlist the pool bakes into spares (config.allowNet).
 * @param {{timeoutMs:number, memoryMb:number}} [opts.limits] Caps the pool bakes in (config.limits).
 * @param {'node'|'llrt'} [opts.runtime] JS runtime inside the µVM (config.sandboxRuntime; default node).
 * @param {string|null} [opts.llrtBin] Host path to the static llrt binary (required for runtime=llrt).
 * @param {{useSystemCa:boolean, extraCaCerts:string|null}|null} [opts.tls] Dev CA trust (config.tls); for
 *        llrt the CA file is bind-mounted and exposed via LLRT_EXTRA_CA_CERTS. Process-constant, so
 *        it is baked into the µVM/spares here (not taken per-run, unlike the host node/deno engines).
 * @returns {import('../executor.js').SandboxExecutor}
 */
export function createMicrosandboxExecutor({
  image = DEFAULT_MICROSANDBOX_IMAGE,
  poolSize = 0,
  allowNet,
  limits,
  runtime = 'node',
  llrtBin = null,
  tls = null,
} = {}) {
  // The dev CA is bind-mounted into the µVM only when llrt needs to trust it
  // (prod uses public CAs → no mount, no env). Captured once: process-constant.
  const caCertHost = runtime === 'llrt' ? tls?.extraCaCerts ?? null : null;
  // The llrt command: the bind-mounted loose binary (GUEST_LLRT) when OA_LLRT_BIN is
  // set, else `llrt` on the baked image's PATH. Derived ONCE here so the exec command
  // can't drift from buildSandbox's mount decision (both gate on llrtBin).
  const llrtCmd = llrtBin ? GUEST_LLRT : 'llrt';
  // Lazy, cached pool init. Resolves to { pool, key } once the SDK has loaded and
  // a pool is warranted, else null (pooling off, unsupported host, or no config to
  // bake). The pool bakes the egress policy + caps from the server config; run()
  // only uses it for a request whose signature matches that baked config.
  /** @type {Promise<{pool: ReturnType<typeof createWarmPool>, key: string} | null> | null} */
  let poolPromise = null;
  // Synchronous handle on the live pool (once created), so the metrics layer can
  // read its stats without awaiting poolPromise. Null until/unless a pool exists.
  /** @type {ReturnType<typeof createWarmPool> | null} */
  let livePool = null;
  // Boot baseline (pre-exec VMM stats: RSS + CPU) for the workload_* metrics, measured
  // ONCE per executor and cached: the boot floor is ~constant for this config's
  // runtime/image, so we pay the extra /proc scan a single time, not per run.
  /** @type {{hwmBytes:number|null, cpuSeconds:number|null} | null} */
  let bootBaseline = null;
  function ensurePool() {
    if (poolSize <= 0 || !allowNet || !limits) return Promise.resolve(null);
    if (!poolPromise) {
      poolPromise = loadMicrosandbox()
        .then((msb) => {
          if (!msb) return null;
          const { Rule, Destination } = msb;
          const params = {
            image,
            memoryMb: limits.memoryMb,
            policy: buildPolicy({ Rule, Destination }, allowNet),
            runtime,
            llrtBin,
            caCertHost,
          };
          const pool = createWarmPool({
            size: poolSize,
            create: () => buildSandbox(msb, params),
            destroy: destroySandbox,
            // Retire a spare before it could expire mid-run: serve only while its
            // remaining life covers a full run + slack (see SANDBOX_LIFETIME_S /
            // SPARE_LIFETIME_MARGIN_MS). Margin uses the configured per-run timeout.
            maxAgeMs:
              SANDBOX_LIFETIME_S * 1000
              - (limits.timeoutMs + SPARE_LIFETIME_MARGIN_MS),
            // Background spare boots fail silently otherwise (only a stats counter):
            // surface them so an operator sees a pool that has quietly stopped
            // warming (KVM exhaustion, image-pull throttling, …).
            onError: (err) =>
              log.warn(
                'warm pool: background µVM create failed: %s',
                errMsg(err),
              ),
          });
          livePool = pool; // expose to poolStats() (metrics)
          pool.refill(); // warm on boot
          return {
            pool,
            key: sigKey({ memoryMb: limits.memoryMb, allowNet }),
          };
        })
        .catch((err) => {
          // Pool construction failed (e.g. the SDK threw while building the policy
          // or booting the first spare). Don't leave the eager warm-up's discarded
          // promise as an unhandled rejection, and don't cache the rejection (which
          // would poison every later ensurePool()). Reset so a subsequent request
          // retries, and resolve null so run() degrades to per-run fresh µVMs.
          poolPromise = null;
          log.warn(
            'warm pool init failed; falling back to per-run µVMs: %s',
            errMsg(err),
          );
          return null;
        });
    }
    return poolPromise;
  }
  // Start warming immediately when pooling is on, so spares are ready before the
  // first request (rather than the first run paying the cold create).
  if (poolSize > 0 && allowNet && limits) ensurePool();

  return {
    name: 'microsandbox',
    // Warm-pool stats for the metrics observable (null until a pool exists, e.g.
    // pooling off or still initialising). `idle` is the current ready-spare count.
    poolStats: () =>
      (livePool ? { ...livePool.stats, idle: livePool.idleCount } : null),
    run: async ({
      code,
      env: reqEnv,
      allowNet: reqAllowNet,
      egressAuthority,
      limits: reqLimits,
    }) => {
      const msb = await loadMicrosandbox();
      if (!msb) {
        return failure(
          'microsandbox is not available. It is an optional dependency requiring a '
            + 'virtualization host (Linux + /dev/kvm, or macOS Apple Silicon). Install it on a '
            + 'supported host (`yarn workspace @openagenda/mcp add microsandbox`), or use '
            + 'OA_EXECUTOR=deno locally. See public/mcp/docs/microsandbox.md.',
        );
      }
      const { Rule, Destination } = msb;

      // microsandbox owns its egress (host-enforced µVM policy). config.js fails
      // closed so this engine is only ever reached with egressAuthority=executor;
      // assert it rather than silently run without the boundary we promise.
      if (egressAuthority !== 'executor') {
        return failure(
          `microsandbox owns its own egress and requires egressAuthority=executor (got "${egressAuthority}").`,
        );
      }

      const policy = buildPolicy({ Rule, Destination }, reqAllowNet);

      // Pooled fast path ONLY when the request matches the pool's baked config
      // (same egress policy + caps) — a warm spare with a different baked policy
      // would be the WRONG boundary. Otherwise (pool off/unavailable/mismatch),
      // create a fresh µVM with this request's exact config. Either way it is a
      // unique, single-use µVM, destroyed after the run.
      const poolEntry = await ensurePool();
      const usePool = poolEntry != null
        && poolEntry.key
          === sigKey({ memoryMb: reqLimits.memoryMb, allowNet: reqAllowNet });

      let sb;
      try {
        sb = usePool && poolEntry
          ? await poolEntry.pool.acquire()
          : await buildSandbox(msb, {
            image,
            memoryMb: reqLimits.memoryMb,
            policy,
            runtime,
            llrtBin,
            caCertHost,
          });
      } catch (err) {
        return failure(`microsandbox failed to start a µVM: ${errMsg(err)}`);
      }

      // Locate this µVM's VMM by its unique name for the host-side resource metrics.
      // `sb.name` is a local property (no agent round-trip). Measure the boot baseline
      // (pre-exec RSS + CPU) the first time only — the boot floor is ~constant for this
      // config — so workload_* can be derived from it without a per-run scan.
      const sbName = sb?.name ?? null;
      if (bootBaseline == null && sbName) {
        const pre = await readVmmStats(sbName);
        if (pre) bootBaseline = pre;
      }

      try {
        const out = runtime === 'llrt'
          ? await execLlrt(
            sb,
            code,
            reqEnv,
            reqLimits.timeoutMs,
            caCertHost,
            llrtCmd,
          )
          : await execNode(sb, code, reqEnv, reqLimits.timeoutMs);
        const { stdout, outputCapped } = capOutput(out.stdout());
        return {
          stdout,
          stderr: out.stderr(),
          timedOut: false,
          outputCapped,
          exitCode: out.code,
        };
      } catch (err) {
        if (isExecTimeout(err)) {
          return {
            stdout: '',
            stderr: '[killed: wall-clock timeout]',
            timedOut: true,
            exitCode: null,
          };
        }
        return failure(`microsandbox exec failed: ${errMsg(err)}`);
      } finally {
        // Real per-µVM resource use from the libkrun VMM's /proc, read while it is
        // still alive (before teardown): VmHWM (monotone) and CPU (cumulative) catch a
        // sub-150ms run — sb.metrics() (a 1s sample) would read the idle floor / 0.
        // host_peak + cpu_seconds = real host footprint (capacity); workload_* ≈ what
        // the run touched above boot. Best-effort + isolated: telemetry never affects
        // the result nor blocks teardown.
        try {
          const post = sbName ? await readVmmStats(sbName) : null;
          if (post) {
            recordUvmStats({
              hostPeakBytes: post.hwmBytes ?? undefined,
              workloadPeakBytes:
                post.hwmBytes != null && bootBaseline?.hwmBytes != null
                  ? Math.max(0, post.hwmBytes - bootBaseline.hwmBytes)
                  : null,
              cpuSeconds: post.cpuSeconds ?? undefined,
              workloadCpuSeconds:
                post.cpuSeconds != null && bootBaseline?.cpuSeconds != null
                  ? Math.max(0, post.cpuSeconds - bootBaseline.cpuSeconds)
                  : null,
            });
          }
        } catch {
          // metrics optional — ignore (non-Linux host, teardown race, …)
        }
        // Single-use: destroy the µVM whether it came from the pool or fresh.
        // A cleanup failure must not mask the run's result.
        await destroySandbox(sb);
      }
    },
    // Drain warm spares on shutdown (no-op when pooling is off). Wire to the
    // server's SIGTERM/SIGINT path so idle µVMs don't outlive the process.
    dispose: async () => {
      const entry = await ensurePool();
      if (entry) await entry.pool.drain();
      // Stop poolStats() reporting a drained pool as a healthy empty one: a final
      // metrics flush (shutdownTelemetry runs after executor.dispose) would otherwise
      // publish a stale sample for a resource that no longer exists.
      livePool = null;
    },
  };
}
