import fs from 'node:fs';

export function getJSON(relativePath) {
  return JSON.parse(
    fs.readFileSync(`${import.meta.dirname}/${relativePath}.json`, 'utf-8'),
  );
}

export function asAsync(relativePath) {
  return async () => getJSON(relativePath);
}

export function Tracker() {
  const calls = [];
  return Object.assign(
    (name, returnValue) =>
      async (...args) => {
        calls.push({ name, args });
        return typeof returnValue === 'function' ? returnValue() : returnValue;
      },
    { calls },
  );
}

export function write(fxFolder, name, data) {
  fs.writeFileSync(
    `${import.meta.dirname}/${fxFolder}/${name}.json`,
    JSON.stringify(data, null, 2),
    'utf-8',
  );
}
