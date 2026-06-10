// The argv layer is a pure mapping onto env keys — the security property under
// test is its NARROWNESS: only the whitelisted non-secret flags exist, anything
// else (notably a would-be secret) is rejected, and the overlay never invents
// keys loadConfig doesn't read.

import { parseCliArgs, HELP } from '../src/cli.js';

describe('parseCliArgs', () => {
  it('maps the non-secret flags onto their env keys (--flag=value form)', () => {
    const { envOverrides, error } = parseCliArgs([
      '--transport=http',
      '--port=9000',
      '--executor=deno',
      '--base-url=https://dapi.openagenda.com/v3',
    ]);
    expect(error).toBeUndefined();
    expect(envOverrides).toEqual({
      OA_MCP_TRANSPORT: 'http',
      OA_MCP_HTTP_PORT: '9000',
      OA_EXECUTOR: 'deno',
      OA_BASE_URL: 'https://dapi.openagenda.com/v3',
    });
  });

  it('accepts the space-separated form (--flag value)', () => {
    const { envOverrides } = parseCliArgs(['--executor', 'deno']);
    expect(envOverrides).toEqual({ OA_EXECUTOR: 'deno' });
  });

  it('rejects unknown flags — secrets can never arrive via argv', () => {
    expect(parseCliArgs(['--api-key=oa_pk_x']).error).toMatch(/Unknown option/);
    expect(parseCliArgs(['--oauth-secret', 's']).error).toMatch(
      /Unknown option/,
    );
  });

  it('rejects a flag without a value', () => {
    expect(parseCliArgs(['--port']).error).toMatch(/argument missing/);
  });

  it('does not greedily eat a following flag as a value', () => {
    // --port has no value here; --executor must NOT be silently consumed.
    const { error, envOverrides } = parseCliArgs([
      '--port',
      '--executor',
      'deno',
    ]);
    expect(error).toMatch(/ambiguous/);
    expect(envOverrides).not.toHaveProperty('OA_MCP_HTTP_PORT');
  });

  it('rejects stray positionals', () => {
    expect(parseCliArgs(['serve']).error).toMatch(/Unexpected argument/);
  });

  it('validates --port is numeric (the flag-wins promise, not a silent fallback)', () => {
    expect(parseCliArgs(['--port=abc']).error).toMatch(
      /--port must be a positive integer/,
    );
    expect(parseCliArgs(['--port=8080']).envOverrides).toEqual({
      OA_MCP_HTTP_PORT: '8080',
    });
  });

  it('recognizes help and version (long and short)', () => {
    expect(parseCliArgs(['--help']).help).toBe(true);
    expect(parseCliArgs(['-h']).help).toBe(true);
    expect(parseCliArgs(['--version']).version).toBe(true);
    expect(parseCliArgs(['-v']).version).toBe(true);
  });

  it('parses nothing into an empty overlay (env-only stays the default)', () => {
    expect(parseCliArgs([])).toEqual({ envOverrides: {} });
  });

  it('documents every flag in the help text', () => {
    for (const flag of ['--transport', '--port', '--executor', '--base-url']) {
      expect(HELP).toContain(flag);
    }
  });
});
