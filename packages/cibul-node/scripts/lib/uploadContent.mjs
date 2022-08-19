import fsp from 'node:fs/promises';

export default async function uploadContent(localRoot, path, client) {
  const result = await fsp.readdir(localRoot + path);

  for (const fileOrDir of result) {
    const fileOrDirPath = `${path}/${fileOrDir}`;
    if ((await fsp.stat(localRoot + fileOrDirPath)).isDirectory()) {
      await uploadContent(localRoot, fileOrDirPath, client);
    } else {
      const dir = fileOrDirPath.split('/');
      dir.pop();
      const uploadDir = dir.join('/').replace('.next', '_next');
      try {
        await client.mkdir(uploadDir, { recursive: true });
      } catch (e) {}
      await client.put(localRoot + fileOrDirPath, `${uploadDir}/${fileOrDir}`);
      console.log('uploaded %s to %s', fileOrDir, uploadDir);
    }
  }
}
