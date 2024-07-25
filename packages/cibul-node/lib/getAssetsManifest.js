import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const statsPath = fileURLToPath(import.meta.resolve('@openagenda/cibul-templates/dist/js/assets-manifest.json'));
const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));

export default async function getAssetsManifest() {
  if (process.env.NODE_ENV === 'development') {
    // can change with hot reload
    return JSON.parse(await fs.promises.readFile(statsPath, 'utf-8'));
  }

  return stats;
}
