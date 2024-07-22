import path from 'node:path';
import { glob } from 'glob';
import listFiles from './utils/listFiles.js';

function findJavaScriptFiles() {
  try {
    return glob('**/*.{js,mjs}', {
      ignore: ['node_modules/**', 'services/mails/templates/**', 'test/**'],
      root: path.join(import.meta.dirname, '..'),
    });
  } catch (err) {
    console.error('Erreur lors de la recherche des fichiers:', err);
  }
}

const allFiles = await findJavaScriptFiles();

const entryFile = path.join(import.meta.dirname, '../server.js');
const usedFiles = listFiles(entryFile)
  .map(v => v.replace(path.join(import.meta.dirname, '../'), ''));

const unusedFiles = allFiles.filter(file => !usedFiles.includes(file));

console.log('Fichiers potentiellement inutilisés:');
console.log(unusedFiles.join('\n'));
