import copyAndEditFile from './copyAndEditFile.mjs';

export default async function buildEcosystemFile(args, options = {}) {
  const {
    envVars,
    dir,
    instances,
    nodeArgs = '',
  } = options;

  const argsList = [].concat(args);
  const argsListStringified = argsList.map((arg) => `'${arg}'`).join(',');

  const configFilePath = `${dir}/${argsListStringified.replace(/\s|:|,|'/g, '-')}.config.js`;

  await copyAndEditFile('ecosystem.config.js', configFilePath, {
    env: JSON.stringify(envVars, null, 2),
    appArgList: argsListStringified,
    node_args: nodeArgs,
    instances,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
  });

  return configFilePath;
}
