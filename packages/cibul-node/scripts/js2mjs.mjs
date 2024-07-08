import path from 'node:path';
import listFiles from './utils/listFiles.mjs';

const entryFile = path.join(import.meta.dirname, '../server.mjs');

const files = listFiles(entryFile, true)
  .map(v => v.replace(path.join(import.meta.dirname, '../'), ''));

console.log(files.length);
console.log(files.reverse().join('\n'));
