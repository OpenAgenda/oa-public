import path from 'node:path';
import listFiles from './utils/listFiles.js';

const entryFile = path.join(import.meta.dirname, '../server.js');

const files = listFiles(entryFile, true).map((v) =>
  v.replace(path.join(import.meta.dirname, '../'), ''));

console.log(files.length);
console.log(files.reverse().join('\n'));
