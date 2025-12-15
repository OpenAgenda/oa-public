import { exec as execCb } from 'node:child_process';
import { promisify } from 'util';

const exec = promisify(execCb);

export default async function sftp(
  nodes,
  file,
  destPath,
  { SSHKeyPath, user = 'root' },
) {
  const results = [];
  for (const node of nodes) {
    const endpoint = `${user}@${node.address}`;
    console.log('sftp of %s to %s %s', file, endpoint, destPath);
    const result = await exec(
      `scp -i ${SSHKeyPath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${file} ${endpoint}:${destPath}`,
      {
        maxBuffer: Infinity,
      },
    );
    console.log('  done.');
    results.push({
      node,
      result,
    });
  }
  return results;
}
