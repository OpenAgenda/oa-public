import fs from 'fs';

export default async function clearDir(dir) {
  for (const item of await fs.promises.readdir(dir)) {
    await fs.promises.rm(`${dir}/${item}`, {
      recursive: true
    });
  }
}
