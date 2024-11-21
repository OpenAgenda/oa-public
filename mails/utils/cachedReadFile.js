import fs from 'node:fs/promises';

export default async function cachedReadFile(cache, filePath) {
  if (cache.has(filePath)) {
    return cache.get(filePath);
  }

  const result = await fs.readFile(filePath, 'utf8');

  cache.set(filePath, result);

  return result;
}
