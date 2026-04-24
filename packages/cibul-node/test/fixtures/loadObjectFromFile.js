import fs from 'node:fs';
import path from 'node:path';

export default function load(filePath, dataOrFn = null) {
  const json = JSON.parse(
    fs.readFileSync(path.join(import.meta.dirname, filePath), 'utf-8'),
  );

  return typeof dataOrFn === 'function'
    ? dataOrFn(json)
    : { ...json, ...dataOrFn };
}
