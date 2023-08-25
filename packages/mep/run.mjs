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
  LOCAL_ENV_FILE_PATH: localEnvFilePath,
  RUN_BUILD: runBuild,
  RUN_UPLOAD_TO_WEB: runUploadToWeb,
  RUN_UPLOAD_TO_TASK: runUploadToTask,
  RUN_UPDATE_WEB: runUpdateWeb,
  RUN_UPDATE_API: runUpdateAPI,
  RUN_UPDATE_NEXT: runUpdateNext,
  RUN_UPDATE_TASK: runUpdateTask,
  RUN_UPDATE_NGINX: runUpdateNginx,
  RUN_ALL: runAll,
  WEB_ENV_NAME: webEnvName,
  TASK_ENV_NAME: taskEnvName,
} = process.env;

const remoteNginxDir = '/var/lib/nginx/config';
const pm2Commands = [
  'pm2 startOrReload ecosystem.config.js --update-env',
  'pm2 save',
];

const envVars = Object.assign(
  await fs.readFile(envFilePath, 'utf8').then(data => JSON.parse(data)),
  await fs.readFile(localEnvFilePath, 'utf8').then(data => JSON.parse(data)),
);

const response = await getNodesAndGroups(webEnvName, ['web', 'next', 'api'], { jelasticAccessToken });

const {
  nodeGroups,
  nodes,
} = response;

if (runBuild || runAll) {
  await clearDir(dir);
  await cloneAndBuild({
    dir,
    nodeGroups,
    envVars,
  });
}

const uploads = [];

if (runUploadToWeb || runAll) {
  uploads.push(async () => {
    const nodes = (await getNodesAndGroups(webEnvName, ['data'], { jelasticAccessToken })).nodes;
    await rsync(nodes, `${dir}/oa`, '/data/oa', { SSHKeyPath });
  });
}

if (runUploadToTask || runAll) {
  uploads.push(async () => {
    const taskNodes = (await getNodesAndGroups(taskEnvName, null, { jelasticAccessToken })).nodes;
    await rsync(taskNodes, `${dir}/oa`, '/root/oa', { SSHKeyPath });
  });
}

await Promise.all(uploads.map(run => run()));

const runs = [];

if (runUpdateWeb || runAll) {
  runs.push(async () => {
    const nodes = (await getNodesAndGroups(webEnvName, ['web'], { jelasticAccessToken })).nodes;
    await buildAndUploadEcosystemFile(nodes, 'web admin', {
      SSHKeyPath,
      envVars,
      dir,
      instances: 4,
    });
    await rexec(nodes, pm2Commands, { SSHKeyPath });
  });
}

if (runUpdateAPI || runAll) {
  runs.push(async () => {
    const nodes = (await getNodesAndGroups(webEnvName, ['api'], { jelasticAccessToken })).nodes;
    await buildAndUploadEcosystemFile(nodes, 'api', {
      SSHKeyPath,
      envVars,
      dir,
      instances: 4,
    });
    await rexec(nodes, pm2Commands, { SSHKeyPath });
  });
}

if (runUpdateNext || runAll) {
  runs.push(async () => {
    const nextNodes = (await getNodesAndGroups(webEnvName, ['next'], { jelasticAccessToken })).nodes;

    await copyAndEditFile('next.config.js', `${dir}/next.config.js`, {
      port: envVars.OA_SERVER_PORT,
    });
    await sftp(nextNodes, `${dir}/next.config.js`, 'ecosystem.config.js', { SSHKeyPath });

    await rexec(nextNodes, pm2Commands, { SSHKeyPath });
  });
}

if (runUpdateTask || runAll) {
  runs.push(async () => {
    const taskNodes = (await getNodesAndGroups(taskEnvName, null, { jelasticAccessToken })).nodes;
    await buildAndUploadEcosystemFile(taskNodes, 'task', {
      SSHKeyPath,
      envVars,
      dir,
      instances: 1,
    });
    await rexec(taskNodes, pm2Commands, { SSHKeyPath });
  });
}

if (runUpdateNginx || runAll) {
  runs.push(async () => {
    await prepareNginxFiles({
      dir,
      jelasticAccessToken,
      SSHKeyPath,
      envVars,
      nodes,
      remoteNginxDir,
    });
    await uploadNginxFilesAndReload({
      dir,
      webEnvName,
      jelasticAccessToken,
      remoteNginxDir,
      SSHKeyPath,
    });
  });
}

await Promise.all(runs.map(run => run()));

console.log('done');
