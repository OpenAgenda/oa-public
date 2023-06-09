import fs from 'fs/promises';

import clearDir from './lib/clearDir.mjs';
import cloneAndBuild from './lib/cloneAndBuild.mjs';
import rsync from './lib/rsync.mjs';
import rexec from './lib/rexec.mjs';
import sftp from './lib/sftp.mjs';
import getNodesAndGroups from './lib/getNodesAndGroups.mjs';
import prepareNginxFiles from './lib/prepareNginxFiles.mjs';
import buildAndUploadEcosystemFile from './lib/buildAndUploadEcosystemFile.mjs';
import uploadNginxFilesAndReload from './lib/uploadNginxFilesAndReload.mjs';
import copyAndEditFile from './lib/copyAndEditFile.mjs';

const {
  JOB_DIR: dir,
  JELASTIC_SSH_KEY: SSHKeyPath,
  JELASTIC_ACCESS_TOKEN: jelasticAccessToken,
  ENV_FILE_PATH: envFilePath,
  RUN_BUILD: runBuild,
  RUN_UPLOAD_TO_WEB: runUploadToWeb,
  RUN_UPLOAD_TO_API: runUploadToAPI,
  RUN_UPLOAD_TO_NEXT: runUploadToNext,
  RUN_UPDATE_NGINX: runUpdateNginx,
  RUN_UPLOAD_TO_TASK: runUploadToTask,
  RUN_ALL: runAll,
  WEB_ENV_NAME: webEnvName,
  WEB_TASK_NAME: taskEnvName,
} = process.env;

const remoteNginxDir = '/var/lib/nginx/config';
const pm2Commands = [
  'pm2 startOrReload ecosystem.config.js --update-env',
  'pm2 save',
];

const envVars = await fs.readFile(envFilePath, 'utf8').then(data => JSON.parse(data));

const {
  nodeGroups
} = await getNodesAndGroups(webEnvName, ['web', 'next', 'api'], { jelasticAccessToken });

if (runBuild || runAll) {
  await clearDir(dir);
  await cloneAndBuild({
    dir,
    nodeGroups,
    envVars,
  });
}

const runs = [];

if (runUploadToAPI || runAll) {
  runs.push(async () => {
    const nodes = (await getNodesAndGroups(webEnvName, ['api'], { jelasticAccessToken })).nodes;
    await buildAndUploadEcosystemFile(nodes, 'api', { SSHKeyPath, envVars, dir });
    await rsync(nodes, `${dir}/oa`, '/root/oa', { SSHKeyPath });
    await rexec(nodes, pm2Commands, { SSHKeyPath });
  });
}

if (runUploadToWeb || runAll) {
  runs.push(async () => {
    const nodes = (await getNodesAndGroups(webEnvName, ['web'], { jelasticAccessToken })).nodes;
    await buildAndUploadEcosystemFile(nodes, 'web admin', { SSHKeyPath, envVars, dir });
    await rsync(nodes, `${dir}/oa`, '/root/oa', { SSHKeyPath });
    await rexec(nodes, pm2Commands, { SSHKeyPath });
  });
}

if (runUploadToNext || runAll) {
  runs.push(async () => {
    const nextNodes = (await getNodesAndGroups(webEnvName, ['next'], { jelasticAccessToken })).nodes;
    await rsync(nextNodes, `${dir}/oa`, '/root/oa', { SSHKeyPath });

    await copyAndEditFile('next.config.js', `${dir}/next.config.js`, {
      port: envVars.OA_SERVER_PORT,
    });
    await sftp(nextNodes, `${dir}/next.config.js`, 'ecosystem.config.js', { SSHKeyPath });

    await rexec(nextNodes, pm2Commands, { SSHKeyPath });
  });
}

if (runUploadToTask || runAll) {
  runs.push(async () => {
    const taskNodes = (await getNodesAndGroups(taskEnvName, null, { jelasticAccessToken })).nodes;
    await buildAndUploadEcosystemFile(taskNodes, 'task', { SSHKeyPath, envVars, dir });
    await rsync(taskNodes, `${dir}/oa`, '/root/oa', { SSHKeyPath });
    await rexec(taskNodes, pm2Commands, { SSHKeyPath });
  });
}

await Promise.all(runs.map(run => run()));

if (runUpdateNginx || runAll) {
  await prepareNginxFiles({
    dir,
    jelasticAccessToken,
    SSHKeyPath,
    envVars,
    nodeGroups,
    remoteNginxDir,
  });
  await uploadNginxFilesAndReload({
    dir,
    webEnvName,
    jelasticAccessToken,
    remoteNginxDir,
    SSHKeyPath,
  });
}

console.log('done');