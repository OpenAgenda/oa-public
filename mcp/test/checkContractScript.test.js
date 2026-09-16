import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// The CLI resolves the contract it is given against the working directory.
// Built by string concatenation, that URL broke on a directory with a space
// (or `#`, `?`, `%`) in it, and the messages printed the percent-encoded
// `pathname` rather than a path anyone typed.
const script = fileURLToPath(
  new URL('../scripts/check-contract.js', import.meta.url),
);
const contract = fileURLToPath(
  new URL(import.meta.resolve('@openagenda/api-spec/openapi.yaml')),
);

describe('check-contract.js', () => {
  it('finds the contract from a working directory with a space in its name', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'oa mcp #'));
    try {
      const out = execFileSync(
        process.execPath,
        [script, relative(cwd, contract)],
        {
          cwd,
          encoding: 'utf8',
        },
      );
      expect(out).toBe(
        `search_docs can render every construct in ${contract}.\n`,
      );
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
