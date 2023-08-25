import { exec as execCb } from 'node:child_process';
import { promisify } from 'util';

const exec = promisify(execCb)

/*
a: archive = -rlptgoD (no -H,-A,-X)
A: preserve ACLs (implies -p)
X: preserve extended attributes
E: preserve executability
W: copy files whole (w/o delta-xfer algorithm)
H: preserve hard links
x: don't cross filesystem boundaries
--del: receiver deletes during xfer, not before

r: recurse into directories
l: copy symlinks as symlinks
p: preserve permissions
t: preserve modification times
g: preserve group
o: preserve owner (super-user only)
D: same as --devices --specials

--devices: preserve device files (super-user only)
--specials: preserve special files
 */

export default async function rsync(nodes, srcFolder, destPath, {
  SSHKeyPath,
  options = '-aAXEWHx --del',
}) {
  const results = [];
  for (const node of nodes) {
    console.log(`rsync to node ${node.connectionEndpoint}`);
    const result = await exec(
      `rsync ${options} -e 'ssh -i ${SSHKeyPath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null' ${srcFolder}/ ${node.connectionEndpoint}:${destPath}`,
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
