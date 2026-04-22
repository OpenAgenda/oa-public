import { Client } from 'ssh2';
import fs from 'fs';

function processStream(stream, prefix, writer) {
  let buffer = '';

  stream.on('data', (data) => {
    buffer += data.toString();

    const lines = buffer.split('\n');
    buffer = lines.pop();
    lines.forEach((line) => writer(prefix + line + '\n'));
  });

  stream.on('end', () => {
    if (buffer) {
      writer(prefix + buffer + '\n');
    }
  });
}

async function runCommand(conn, command) {
  return new Promise((resolve, reject) => {
    console.log(' %s', command);

    conn.exec(command, (err, stream) => {
      if (err) return reject(err);

      processStream(stream, '  > ', process.stdout.write.bind(process.stdout));

      processStream(
        stream.stderr,
        '  error> ',
        process.stderr.write.bind(process.stderr)
      );

      stream.on('close', (code, signal) => {
        if (code === 0) return resolve();
        reject(new Error(`remote command exited with code ${code}${signal ? ` (signal ${signal})` : ''}: ${command}`));
      });
    });
  });
}


export default async function rexec(
  nodes,
  commands,
  { SSHKeyPath, user = 'root' },
) {
  const privateKey = await fs.promises.readFile(SSHKeyPath, 'utf-8');
  return Promise.all(
    nodes.map((node) => {
      return new Promise((rs, rj) => {
        const conn = new Client();

        conn
          .on('ready', async () => {
            try {
              for (const command of commands) {
                await runCommand(conn, command);
              }
              conn.end();
              rs();
            } catch (err) {
              conn.end();
              rj(err);
            }
          })
          .connect({
            host: node.address,
            privateKey,
            username: user,
          });

        conn.on('error', (err) => {
          rj(err);
        });
      });
    }),
  );
}
