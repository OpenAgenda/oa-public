import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Client from 'ftp';
import FTP from './lib/FTP.mjs';
import uploadContent from './lib/uploadContent.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client();

client.connect({
  host: process.env.KEYCDN_NEXT_FTP_HOST,
  port: process.env.KEYCDN_NEXT_FTP_PORT ?? 21,
  secure: true,
  user: process.env.KEYCDN_NEXT_FTP_USER,
  password: process.env.KEYCDN_NEXT_FTP_PASSWORD
});

client.on('ready', async () => {
  const pClient = FTP(client);

  await uploadContent(`${__dirname}/../`, '.next/static', pClient);

  await pClient.logout();
});
