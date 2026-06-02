#!/usr/bin/env node
// Entry point: wire config → executor → MCP server → stdio transport.
//
// Also a tiny CLI: `openagenda-mcp print-egress-policy [--format=srt|json]`
// emits the egress allowlist an outer `wrapper` must enforce (see egressPolicy.js).

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig, allowNetFromEnv } from './config.js';
import { createExecutor } from './sandbox/executor.js';
import { createServer } from './server.js';
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

async function main() {
  if (process.argv[2] === 'print-egress-policy') {
    printEgressPolicy(process.argv.slice(3));
    return;
  }

  const config = loadConfig(); // throws (fail-closed) on an unsafe/incoherent pairing
  const executor = createExecutor(config);
  const server = createServer({ config, executor });

  // Drain engine resources (a warm µVM pool, when OA_MICROSANDBOX_POOL_SIZE>0) on
  // shutdown so pre-booted spares don't leak. No-op for the pool-less default; an
  // in-flight run owns its own µVM and tears it down itself, so this only drains
  // idle spares. Covers `kill` (SIGTERM), Ctrl-C (SIGINT), and the MCP client
  // closing the stdio pipe (stdin close). Registered BEFORE connect() so a signal
  // arriving during startup still drains rather than hitting Node's default
  // disposition (which would exit without releasing warm µVMs).
  let closing = false;
  const shutdown = async (reason) => {
    if (closing) return;
    closing = true;
    process.stderr.write(`[openagenda-mcp] shutting down (${reason})\n`);
    try {
      await executor.dispose?.();
    } catch {
      // best-effort drain — never block exit on cleanup
    }
    process.exit(0);
  };
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.stdin.once('close', () => shutdown('stdin closed'));

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // stdio transport OWNS stdout (it's the MCP channel) — all logs go to stderr.
  process.stderr.write(
    `[openagenda-mcp] ready (mode=${config.mode}, executor=${executor.name}, `
      + `egress=${config.egressAuthority}, base=${config.baseUrl})\n`,
  );

  // Make a delegated or absent boundary LOUD — the app can't verify a wrapper.
  if (config.egressAuthority === 'wrapper') {
    process.stderr.write(
      '[openagenda-mcp] egress authority = wrapper: this process does NOT enforce a '
        + `network boundary itself. Ensure the outer sandbox allows exactly: ${config.allowNet.join(', ')} `
        + '(run `openagenda-mcp print-egress-policy` for the exact policy).\n',
    );
  } else if (config.egressAuthority === 'none') {
    process.stderr.write(
      '[openagenda-mcp] OA_LOCAL_NO_SANDBOX: executed code has NO network boundary'
        + `${config.executor === 'node' ? ' and NO filesystem boundary' : ''} `
        + '— trusted local use only.\n',
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
    process.stderr.write(
      '[openagenda-mcp] TLS trust (OA_USE_SYSTEM_CA / OA_EXTRA_CA_CERTS) is set but '
        + 'executor=microsandbox does NOT apply it inside the µVM. A private-CA host will fail '
        + 'TLS — use OA_EXECUTOR=deno for a private-CA dev stack, or a public-CA endpoint.\n',
    );
  }
}

main().catch((err) => {
  process.stderr.write(`[openagenda-mcp] fatal: ${err?.message ?? err}\n`);
  process.exit(1);
});
