import sftp from './sftp.mjs';
import buildEcosystemFile from './buildEcosystemFile.mjs';

export default async function buildAndUploadEcosystemFile(nodes, args, options = {}) {
  const {
    SSHKeyPath,
  } = options;

  const configFilePath = await buildEcosystemFile(args, options);

  await sftp(
    nodes,
    configFilePath,
    'ecosystem.config.js',
    { SSHKeyPath },
  );
}
