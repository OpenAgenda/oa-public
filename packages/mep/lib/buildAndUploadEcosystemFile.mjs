import sftp from './sftp.mjs';
import copyAndEditFile from './copyAndEditFile.mjs';
  
export default async function buildAndUploadEcosystemFile(nodes, args, options = {}) {
  const {
    SSHKeyPath,
    envVars,
    dir,
  } = options;

  const configFilePath = `${dir}/${args.replace(/\s/g, '-')}.config.js`;

  await copyAndEditFile('ecosystem.config.js', configFilePath, {
    env: JSON.stringify(envVars, null, 2),
    args,
  });

  await sftp(
    nodes,
    configFilePath, 
    'ecosystem.config.js', 
    { SSHKeyPath }
  );
}