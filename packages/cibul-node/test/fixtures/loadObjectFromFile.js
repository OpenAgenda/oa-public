import fs from 'node:fs';
import path from 'node:path';

export default function loadObjectFromFile(options = {}) {
  const { cwd = import.meta.dirname } = options;

  return (filePath, dataOrFn = null) => {
    const json = JSON.parse(fs.readFileSync(path.join(cwd, filePath), 'utf-8'));

    return typeof dataOrFn === 'function'
      ? dataOrFn(json)
      : {
        ...json,
        ...dataOrFn,
      };
  };
}
