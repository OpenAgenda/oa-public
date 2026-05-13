import fs from 'node:fs';
import path from 'node:path';

export default function isPackageModule(dir = process.cwd()) {
  let currentDir = dir;

  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      return packageJson.type === 'module';
    }

    currentDir = path.dirname(currentDir);
  }

  return false;
}
