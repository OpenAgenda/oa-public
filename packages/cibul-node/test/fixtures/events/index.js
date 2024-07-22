import fs from 'node:fs';

export default fs
  .readdirSync(import.meta.dirname)
  .filter(f => f !== 'index.js')
  .reduce(
    (fixtures, filename) => ({
      ...fixtures,
      [filename.split('.').shift()]: JSON.parse(fs.readFileSync(`${import.meta.dirname}/${filename}`, 'utf-8')),
    }),
    {},
  );
