// Thin argv layer over the env config plane. Flags cover the NON-SECRET,
// human-invocation knobs only, and each maps onto the same env key loadConfig
// reads — the flag wins over the env, and loadConfig stays the single source
// of truth (this module only produces an env overlay). Secrets and the full
// configuration surface stay env-only ON PURPOSE: argv is visible in `ps`/
// `/proc`, so no flag will ever carry a credential.

import { parseArgs } from 'node:util';
import pkg from '../package.json' with { type: 'json' };

// The non-secret flags, and the env key each overlays. parseArgs handles the
// grammar (--flag=value / --flag value, short aliases, strict unknown/missing/
// ambiguous-value rejection); we only own the option→env mapping and the value
// shape checks below.
// option name → env key. Listed separately from the parseArgs options (inlined
// below) so the boolean help/version flags don't appear here.
const OPTION_TO_ENV = {
  transport: 'OA_MCP_TRANSPORT',
  port: 'OA_MCP_HTTP_PORT',
  executor: 'OA_EXECUTOR',
  'base-url': 'OA_BASE_URL',
};

export const HELP = `openagenda-mcp ${pkg.version} — OpenAgenda MCP server (code-mode tools over the v3 API)

Usage:
  openagenda-mcp [flags]                            start the server
  openagenda-mcp print-egress-policy [--format=srt|json]
                                                    emit the wrapper egress policy

Flags (each maps to an env var; the flag wins):
  --transport=stdio|http             OA_MCP_TRANSPORT   (default: stdio)
  --port=<n>                         OA_MCP_HTTP_PORT   (default: 8904; http only)
  --executor=node|deno|microsandbox  OA_EXECUTOR        (local default: node;
                                                         deno = scoped-egress upgrade)
  --base-url=<url>                   OA_BASE_URL        (default: https://api.openagenda.com/v3)
  -h, --help                         this help
  -v, --version                      print the version

Secrets and every other knob are env-only (see README → "Config (env)"):
  OA_API_KEY                         the stdio credential (required for stdio;
                                     the http transport authenticates via OAuth)
`;

/**
 * Parse the server argv (after the optional subcommand was handled).
 *
 * @param {string[]} argv  e.g. process.argv.slice(2)
 * @returns {{help?: true, version?: true, error?: string,
 *            envOverrides: Record<string,string>}}
 */
export function parseCliArgs(argv) {
  let values;
  try {
    // Options inlined so TS infers both the literal option `type`s and the
    // shape of `values` (the keys below) by contextual typing.
    ({ values } = parseArgs({
      args: argv,
      options: {
        transport: { type: 'string' },
        port: { type: 'string' },
        executor: { type: 'string' },
        'base-url': { type: 'string' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
      },
      allowPositionals: false,
      strict: true,
    }));
  } catch (err) {
    // parseArgs throws on unknown options, missing/ambiguous values and stray
    // positionals — surface its message verbatim.
    return {
      error: err instanceof Error ? err.message : String(err),
      envOverrides: {},
    };
  }

  if (values.help) return { help: true, envOverrides: {} };
  if (values.version) return { version: true, envOverrides: {} };

  // "The flag wins" must mean the value actually takes effect — a non-numeric
  // port silently swallowed by config's int() fallback would be a broken
  // promise, so reject it loudly here (parseArgs only checks it's a string).
  if (typeof values.port === 'string' && !/^[0-9]+$/.test(values.port)) {
    return {
      error: `--port must be a positive integer (got "${values.port}")`,
      envOverrides: {},
    };
  }

  /** @type {Record<string,string>} */
  const envOverrides = {};
  for (const [option, envKey] of Object.entries(OPTION_TO_ENV)) {
    // Every mapped option is `type: 'string'`, so a present value is a string;
    // the typeof guard also narrows parseArgs' `string | boolean` value type.
    const value = values[option];
    if (typeof value === 'string') envOverrides[envKey] = value;
  }
  return { envOverrides };
}
