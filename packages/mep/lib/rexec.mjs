import { Client } from 'ssh2';
import fs from 'fs';

async function runCommand(conn, command) {
  return new Promise((rs, rj) => {
    console.log(' %s', command);
    conn.exec(command, (err, stream) => {
      stream.on('close', (code, signal) => {
        rs();
      }).on('data', (data) => {
        console.log('  > ' + data);
      }).stderr.on('data', (data) => {
        console.log('  error> ' + data);
      });
    });
  });
} 

export default async function rexec(nodes, commands, { SSHKeyPath }) {
  const privateKey = await fs.promises.readFile(SSHKeyPath, 'utf-8');
  return Promise.all(nodes.map(node => {
    return new Promise((rs, rj) => {
      const conn = new Client();
  
      conn.on('ready', async () => {
        for (const command of commands) {
          await runCommand(conn, command);
        }

        conn.end();
        rs();
      }).connect({
        host: node.endpoint.split('@').pop(),
        port: 3022,
        privateKey,
        username: node.endpoint.split('@').shift(),
      });

      conn.on('error', (err) => {
        console.log(err);
      });
    });
  }));
}