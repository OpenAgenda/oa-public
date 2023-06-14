import { exec as execCb } from 'node:child_process';
import { promisify } from 'util';

const exec = promisify(execCb)

export default async function rsync(nodes, srcFolder, destPath, {
  SSHKeyPath,
  options = ['verbose', 'archive', 'compress', 'delete', 'delete-after', 'force'],
}) {
  const results = [];
  for (const node of nodes) {
    console.log(`rsync to node ${node.endpoint}`);
    const result = await exec(
      `rsync --${options.join(' --')} -e 'ssh -i ${SSHKeyPath}' ${srcFolder}/ ${node.endpoint}:${destPath}`,
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
