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
//   - egress  → a NetworkPolicy: defaultDeny + allow DNS + allow the API host's
//               first-party suffix (see buildPolicy/egressSuffix for WHY a parent
//               suffix and not the exact host). Host-enforced (every packet is
//               checked before it leaves the µVM), so — unlike node — this engine
//               genuinely OWNS egress; config.js requires egressAuthority=executor.
//   - memory  → .memory(MiB(memoryMb)): a hard µVM RAM cap. Stronger than a V8
//               heap flag (the whole guest is bounded), so we do NOT also pass
//               --max-old-space-size. NOTE: a µVM running node needs real
//               headroom — set OA_SANDBOX_MEMORY_MB well above a bare-process value.
//   - time    → exec .timeout(ms) is the per-run kill (throws ExecTimeoutError);
//               .maxDuration(secs) is a whole-µVM lifetime backstop.
//   - output  → capped post-hoc to the same 1 MiB as the spawn-based engines.
//
// STILL ours (the µVM is isolation, not the whole policy): a scoped per-caller
// OAuth token with NO ambient credential, rate-limit + concurrency cap, an audit
// log, version pinning (beta), and tenant authn. See docs/microsandbox-plan.md.

import { randomUUID } from 'node:crypto';
import { MAX_OUTPUT_BYTES } from '../spawn.js';
import { DEFAULT_MICROSANDBOX_IMAGE } from '../../config.js';
import { createWarmPool } from './microsandboxPool.js';

const SANDBOX_PREFIX = 'oa-mcp-exec'; // a UNIQUE name per run is appended (see below)

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

// microsandbox egress is matched on the TLS SNI of the connection, and — verified
// empirically against 0.5.x — only `domainSuffix('.<parent>')` matches reliably:
//   - `domain('api.openagenda.com')` (exact)            → matches NOTHING (no traffic)
//   - `domainSuffix('api.openagenda.com')` (host)       → matches nothing
//   - `cidr('<resolved-ip>/32')`                        → matches nothing for HTTPS
//   - `domainSuffix('.openagenda.com')` (parent)        → matches api.openagenda.com ✓
// i.e. `domainSuffix('.X')` allows strict subdomains of X. So to reach host
// `a.b.c` we allow its registrable parent `.b.c`. For our API host that is
// `.openagenda.com` — all first-party, arbitrary exfil hosts stay denied.
// (This is why the boundary is a domain suffix, NOT a CIDR pin as once assumed.)
export function egressSuffix(host) {
  const labels = host.split('.');
  // a.b.c → .b.c (drop the leftmost label). An apex host (≤2 labels) has no
  // parent to strip; fall back to the dotted host (rare; documented limitation).
  return labels.length > 2 ? `.${labels.slice(1).join('.')}` : `.${host}`;
}

// Deny-by-default egress that allows DNS resolution + ONLY the API host's parent
// suffix (see egressSuffix). defaultDeny is the boundary: every other SNI is
// dropped before the packet leaves the µVM.
export function buildPolicy({ Rule, Destination }, allowNet) {
  return {
    defaultEgress: 'deny',
    defaultIngress: 'deny',
    rules: [
      Rule.allowDns(),
      ...allowNet.map((host) =>
        Rule.allowEgress(Destination.domainSuffix(egressSuffix(host)))),
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
function buildSandbox(msb, { image, memoryMb, policy }) {
  const { Sandbox, MiB } = msb;
  return Sandbox.builder(`${SANDBOX_PREFIX}-${randomUUID()}`)
    .image(image)
    .cpus(1)
    .memory(MiB(memoryMb))
    .maxDuration(SANDBOX_LIFETIME_S)
    .network((n) => n.policy(policy))
    .create();
}

// Fully tear a µVM down: stop() halts it, removePersisted() drops it from the
// runtime DB so unique-named one-shots don't accumulate. Both best-effort.
async function destroySandbox(sb) {
  await sb.stop().catch(() => {});
  await sb.removePersisted().catch(() => {});
}

// Identity of a spare's BAKED create-time config. A pooled spare may only serve a
// request with the same key — otherwise its frozen egress policy / RAM cap would be
// the wrong boundary. The per-run timeout and env are applied at EXEC, not baked
// (maxDuration is now a constant, not derived from the timeout), so neither is part
// of the key — a spare serves any per-run timeout.
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
 * @returns {import('../executor.js').SandboxExecutor}
 */
export function createMicrosandboxExecutor({
  image = DEFAULT_MICROSANDBOX_IMAGE,
  poolSize = 0,
  allowNet,
  limits,
} = {}) {
  // Lazy, cached pool init. Resolves to { pool, key } once the SDK has loaded and
  // a pool is warranted, else null (pooling off, unsupported host, or no config to
  // bake). The pool bakes the egress policy + caps from the server config; run()
  // only uses it for a request whose signature matches that baked config.
  /** @type {Promise<{pool: ReturnType<typeof createWarmPool>, key: string} | null> | null} */
  let poolPromise = null;
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
              process.stderr.write(
                `[openagenda-mcp] warm pool: background µVM create failed: ${errMsg(err)}\n`,
              ),
          });
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
          process.stderr.write(
            `[openagenda-mcp] warm pool init failed; falling back to per-run µVMs: ${errMsg(err)}\n`,
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
            + 'OA_EXECUTOR=deno locally. See packages/mcp/docs/microsandbox-plan.md.',
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
          });
      } catch (err) {
        return failure(`microsandbox failed to start a µVM: ${errMsg(err)}`);
      }

      try {
        const out = await sb.execWith('node', (b) => {
          const configured = b
            .args(['--input-type=module']) // read the ESM program from stdin
            .stdinBytes(Buffer.from(code, 'utf8'))
            .timeout(reqLimits.timeoutMs);
          return reqEnv && Object.keys(reqEnv).length
            ? configured.envs(reqEnv)
            : configured;
        });
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
    },
  };
}
