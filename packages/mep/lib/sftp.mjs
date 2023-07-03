import { exec as execCb } from 'node:child_process';
import { promisify } from 'util';

const exec = promisify(execCb)

export default async function sftp(nodes, file, destPath, {
  SSHKeyPath,
}) {
  const results = [];
  for (const node of nodes) {
    console.log('sftp of %s to %s %s', file, node.connectionEndpoint, destPath);
    const result = await exec(
      `scp -i ${SSHKeyPath} ${file} ${node.connectionEndpoint}:${destPath}`,
      {
        maxBuffer: Infinity,
      }
    );
    console.log('  done.');
    results.push({
      node,
      result
    });
  }
  return results;
}
