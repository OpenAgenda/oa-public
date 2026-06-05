#!/usr/bin/env node
// Entry point: wire config → executor → MCP server → stdio transport.
//
// Also a tiny CLI: `openagenda-mcp print-egress-policy [--format=srt|json]`
// emits the egress allowlist an outer `wrapper` must enforce (see egressPolicy.js).

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig, allowNetFromEnv } from './config.js';
import { createExecutor } from './sandbox/executor.js';
import { createServer } from './server.js';
import { createHttpApp } from './httpServer.js';
import { assertIssuer } from './auth/assertIssuer.js';
import { initLogging, log, makeAuditRecorder } from './log.js';
import {
  renderEgressPolicy,
  policySha256,
  defaultReadPolicy,
} from './egressPolicy.js';

// `print-egress-policy` — print the wrapper allowlist and exit (no server boot).
// Derived from OA_BASE_URL alone, independent of the executor/egress combo, so
// it works while you are still setting the wrapper up.
function printEgressPolicy(argv, env = process.env) {
  const fmtArg = argv.find((a) => a.startsWith('--format='));
  const format = fmtArg ? fmtArg.slice('--format='.length) : 'srt';
  if (format !== 'srt' && format !== 'json') {
    process.stderr.write(`unknown --format=${format} (use srt|json)\n`);
    process.exit(2);
  }
  const allowNet = allowNetFromEnv(env);
  // stdout stays a clean artifact (e.g. `> srt-settings.json`); the fingerprint
  // and the human note go to stderr.
  process.stdout.write(`${renderEgressPolicy({ allowNet, format })}\n`);
  const { denyRead, allowRead } = defaultReadPolicy();
  process.stderr.write(
    `# egress policy sha256: ${policySha256({ allowNet, denyRead, allowRead })}\n`
      + `# net allow: ${allowNet.join(', ')} | read deny: ${denyRead.join(', ')} `
      + `| read allow: ${allowRead.join(', ')}\n`,
  );
}

// A boot-time notice that MUST reach the operator regardless of the log config:
// the security-posture banners and the "no log sink" warning. Written straight to
// stderr — like the fatal handler — so it is NEVER gated by DEBUG / InsightOps
// (which may both be unset). NOT for per-request or lifecycle logs (those use log).
const banner = (msg) => process.stderr.write(`[openagenda-mcp] ${msg}\n`);

async function main() {
  if (process.argv[2] === 'print-egress-policy') {
    printEgressPolicy(process.argv.slice(3));
    return;
  }

  const config = loadConfig(); // throws (fail-closed) on an unsafe/incoherent pairing
  // Configure logging ONCE, before anything logs. Two env-gated sinks:
  // OA_INSIGHT_OPS_TOKEN → InsightOps (prod); DEBUG=openagenda-mcp* → stderr (dev).
  // Both avoid stdout, so this is safe under stdio (where stdout is the MCP channel).
  initLogging(config.logging);
  // If NEITHER sink is active, say so once on stderr — otherwise every operational
  // log AND the audit trail are silently discarded (a security control going dark
  // with no signal). Coarse check: any DEBUG means the operator wants stderr.
  if (!config.logging.insightOpsToken && !process.env.DEBUG) {
    banner(
      'no log sink configured: set OA_INSIGHT_OPS_TOKEN (prod) or '
        + 'DEBUG=openagenda-mcp* (dev) — operational logs and the audit trail are '
        + 'being discarded.',
    );
  }
  const executor = createExecutor(config);

  // Drain engine resources (a warm µVM pool, when OA_MICROSANDBOX_POOL_SIZE>0) on
  // shutdown so pre-booted spares don't leak. No-op for the pool-less default; an
  // in-flight run owns its own µVM and tears it down itself, so this only drains
  // idle spares. Covers `kill` (SIGTERM), Ctrl-C (SIGINT), and — for stdio — the
  // MCP client closing the pipe (stdin close). Registered BEFORE connect/listen
  // so a signal arriving during startup still drains rather than hitting Node's
  // default disposition (which would exit without releasing warm µVMs).
  let closing = false;
  let httpServer = null;
  const shutdown = async (reason) => {
    if (closing) return;
    closing = true;
    log.info('shutting down (%s)', reason);
    try {
      if (httpServer) await new Promise((resolve) => httpServer.close(resolve));
      await executor.dispose?.();
    } catch {
      // best-effort drain — never block exit on cleanup
    }
    process.exit(0);
  };
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));

  if (config.transport === 'http') {
    // Standalone OAuth resource server (StreamableHTTP behind bearer auth). The
    // server+transport are created per request inside the app (stateless), so
    // there is no top-level McpServer to connect here.
    const { oauth } = config;
    // loadConfig guarantees oauth for transport=http (fail-closed). Assert it so
    // the invariant is explicit and the type narrows for the reads below.
    if (!oauth) throw new Error('transport=http requires OAuth config (unreachable)');
    // Self-check the issuer against the AS metadata BEFORE opening the port:
    // a bare-origin OA_OAUTH_ISSUER (missing the /api/auth basePath) would 401
    // every token silently. Throws on a genuine mismatch (→ fatal exit); a
    // mere unreachable AS only warns (see assertIssuer).
    await assertIssuer({ issuer: oauth.issuer });
    const app = createHttpApp({ config, executor });
    httpServer = app.listen(config.httpPort);
    await new Promise((resolve, reject) => {
      httpServer.once('listening', resolve);
      httpServer.once('error', reject);
    });
    log.info(
      'ready (transport=http, port=%d, mode=%s, executor=%s, egress=%s, base=%s)',
      config.httpPort,
      config.mode,
      executor.name,
      config.egressAuthority,
      config.baseUrl,
    );
    log.info(
      'OAuth resource server: resource=%s, issuer=%s, jwks=%s',
      oauth?.resourceUrl,
      oauth?.issuer,
      oauth?.jwksUrl,
    );
  } else {
    // stdio transport OWNS stdout (it's the MCP channel) — all logs go to stderr.
    // Only stdio has a pipe whose close means "client gone".
    process.stdin.once('close', () => shutdown('stdin closed'));
    const server = createServer({
      config,
      executor,
      recordAudit: makeAuditRecorder({ transport: 'stdio' }),
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);
    log.info(
      'ready (transport=stdio, mode=%s, executor=%s, egress=%s, base=%s)',
      config.mode,
      executor.name,
      config.egressAuthority,
      config.baseUrl,
    );
  }

  // Make a delegated or absent boundary LOUD — the app can't verify a wrapper.
  if (config.egressAuthority === 'wrapper') {
    banner(
      'egress authority = wrapper: this process does NOT enforce a network '
        + 'boundary itself. Ensure the outer sandbox allows exactly: '
        + `${config.allowNet.join(', ')} `
        + '(run `openagenda-mcp print-egress-policy` for the exact policy).',
    );
  } else if (config.egressAuthority === 'none') {
    banner(
      'OA_LOCAL_NO_SANDBOX: executed code has NO network boundary'
        + `${config.executor === 'node' ? ' and NO filesystem boundary' : ''} `
        + '— trusted local use only.',
    );
  }

  // microsandbox can't inject host CA trust into the guest, so it does NOT apply
  // OA_USE_SYSTEM_CA / OA_EXTRA_CA_CERTS. Warn rather than silently ignore them: a
  // private-CA host (e.g. the dev stack) would fail TLS inside the µVM. Public-CA
  // hosts (api.openagenda.com, an ngrok tunnel) are unaffected.
  if (
    config.executor === 'microsandbox'
    && (config.tls.useSystemCa || config.tls.extraCaCerts)
  ) {
    banner(
      'TLS trust (OA_USE_SYSTEM_CA / OA_EXTRA_CA_CERTS) is set but '
        + 'executor=microsandbox does NOT apply it inside the µVM. A private-CA host '
        + 'will fail TLS — use OA_EXECUTOR=deno for a private-CA dev stack, or a '
        + 'public-CA endpoint.',
    );
  }
}

main().catch((err) => {
  // Last-resort fatal: a boot failure can predate initLogging (e.g. loadConfig
  // throws), so write straight to stderr rather than risk a silent pre-init log.
  process.stderr.write(`[openagenda-mcp] fatal: ${err?.message ?? err}\n`);
  process.exit(1);
});
