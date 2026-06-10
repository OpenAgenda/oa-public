// Thin argv layer over the env config plane. Flags cover the NON-SECRET,
// human-invocation knobs only, and each maps onto the same env key loadConfig
// reads — the flag wins over the env, and loadConfig stays the single source
// of truth (this module only produces an env overlay). Secrets and the full
// configuration surface stay env-only ON PURPOSE: argv is visible in `ps`/
// `/proc`, so no flag will ever carry a credential.

import pkg from '../package.json' with { type: 'json' };

const FLAG_TO_ENV = {
  '--transport': 'OA_MCP_TRANSPORT',
  '--port': 'OA_MCP_HTTP_PORT',
  '--executor': 'OA_EXECUTOR',
  '--base-url': 'OA_BASE_URL',
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
  /** @type {Record<string,string>} */
  const envOverrides = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true, envOverrides };
    if (arg === '--version' || arg === '-v') return { version: true, envOverrides };
    // Accept both --flag=value and --flag value.
    const eq = arg.indexOf('=');
    const flag = eq === -1 ? arg : arg.slice(0, eq);
    const envKey = FLAG_TO_ENV[flag];
    if (!envKey) {
      return { error: `unknown argument: ${arg}`, envOverrides };
    }
    let value;
    if (eq === -1) {
      // --flag value: the next token is the value — but only if it isn't itself
      // a flag, else `--port --executor deno` would silently eat `--executor` as
      // the port and drop it. A missing/flag-shaped value is an error, not a
      // greedy consume.
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('-')) {
        return { error: `${flag} requires a value`, envOverrides };
      }
      value = next;
      i += 1;
    } else {
      value = arg.slice(eq + 1);
      if (!value) {
        return { error: `${flag} requires a value`, envOverrides };
      }
    }
    // "The flag wins" must mean the flag's value actually takes effect — a
    // numeric flag silently swallowed by config's int() fallback would be a
    // broken promise. Validate the shape here, where we can error loudly.
    if (flag === '--port' && !/^[0-9]+$/.test(value)) {
      return {
        error: `--port must be a positive integer (got "${value}")`,
        envOverrides,
      };
    }
    envOverrides[envKey] = value;
  }
  return { envOverrides };
}
