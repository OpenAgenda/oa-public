import { exec } from 'node:child_process';

export default async function execCommands(commands, envVars = {}) {
  return new Promise((resolve, reject) => {
    const p = exec(
      commands.join(' && '),
      {
        maxBuffer: Infinity,
        env: {
          ...process.env,
          ...envVars,
        },
      },
      (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve({ stdout, stderr });
      },
    );

    p.stdout.on('data', (data) => {
      console.log(data);
    });

    p.stderr.on('data', (data) => {
      console.log('err', data);
    });
  });
}
