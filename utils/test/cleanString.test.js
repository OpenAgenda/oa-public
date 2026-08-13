import fs from 'node:fs';
import cleanString from '../src/cleanString';

// `__dirname` plutôt qu'`import.meta` : jest transpile ce fichier en CJS.
const dirty = fs.readFileSync(`${__dirname}/dirty.txt`, 'utf-8');
const clean = fs.readFileSync(`${__dirname}/clean.txt`, 'utf-8');

describe('utils.cleanString', () => {
  it('cleans', () => {
    const dirtyChars = dirty.split('\n');

    dirtyChars.pop(); // remove end of file new line

    dirtyChars.forEach((dirtyChar) => {
      expect(cleanString(dirtyChar)).toBe(' ');
    });
  });

  it('does not clean', () => {
    clean.split(';').forEach((cleanChar) => {
      expect(cleanString(cleanChar)).toBe(cleanChar);
    });
  });
});
