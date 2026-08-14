import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const packageRoot = path.resolve(import.meta.dirname, '..');

// An optional argument narrows the run to matching paths, e.g.
// `node scripts/test.js event/test` or `node scripts/test.js addMarkdown`.
const filter = process.argv[2];

const testFiles = ['agenda/test', 'event/test']
  .flatMap((dir) =>
    fs
      .readdirSync(path.join(packageRoot, dir))
      .filter((entry) => entry.endsWith('.test.js'))
      .map((entry) => `${dir}/${entry}`))
  .filter((file) => (filter ? file.includes(filter) : true))
  .sort();

if (!testFiles.length) {
  console.error(`No test file matching "${filter}".`);
  process.exit(1);
}

const outputFolder = process.env.PDF_TEST_FOLDER
  ? path.resolve(process.env.PDF_TEST_FOLDER)
  : fs.mkdtempSync(path.join(os.tmpdir(), 'oa-pdf-exports-'));

fs.mkdirSync(outputFolder, { recursive: true });

const { TEST_TIMEOUT_MS: testTimeoutMs = 180_000 } = process.env;

function run(file) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [file], {
      cwd: packageRoot,
      env: { ...process.env, PDF_TEST_FOLDER: outputFolder },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    child.stdout.on('data', (d) => {
      output += d;
    });
    child.stderr.on('data', (d) => {
      output += d;
    });

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      output += `\ntimed out after ${testTimeoutMs}ms`;
    }, Number(testTimeoutMs));

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, output });
    });
  });
}

const failures = [];
let passed = 0;

for (const file of testFiles) {
  const { code, output } = await run(file);

  if (code === 0) {
    passed += 1;
    console.log(`ok   ${file}`);
  } else {
    failures.push({ file, output });
    console.log(`FAIL ${file}`);
  }
}

console.log(
  `\n${passed} passed${failures.length ? `, ${failures.length} failed` : ''} — rendered in ${outputFolder}`,
);

for (const { file, output } of failures) {
  console.error(`\n--- ${file} ---\n${output.trimEnd()}`);
}

if (failures.length) {
  process.exit(1);
}
