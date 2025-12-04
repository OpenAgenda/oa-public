import fs from 'node:fs';

import clearDir from './lib/clearDir.mjs';
import prepareConfig from './lib/prepareConfig.mjs';
import clone from './lib/clone.mjs';
import pull from './lib/pull.mjs';
import install from './lib/install.mjs';
import build from './lib/build.mjs';
import rsync from './lib/rsync.mjs';
import rexec from './lib/rexec.mjs';
import sftp from './lib/sftp.mjs';
import getNodes from './lib/getNodes.mjs';
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
  RUN_CLONE: runClone,
  RUN_PULL: runPull,
  RUN_CONFIG: runConfig,
  RUN_INSTALL: runInstall,
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
  'pm2 delete ecosystem.config.js',
  'pm2 start ecosystem.config.js',
  'pm2 save',
];

const envVars = Object.assign(
  await fs.promises.readFile(envFilePath, 'utf8').then((data) => JSON.parse(data)),
  await fs.promises.readFile(localEnvFilePath, 'utf8').then((data) => JSON.parse(data)),
);

const nodes = await getNodes(webEnvName, jelasticAccessToken);
const taskNodes = await getNodes(taskEnvName, jelasticAccessToken);

let cloned = false;

if (runClone || runAll) {
  // force clone or empty dir
  if (runClone || fs.readdirSync(dir).length === 0) {
    await clearDir(dir);
    await clone({ dir, envVars });
    cloned = true;
  } else {
    console.log(`skip cloning, ${dir} is not empty`);
  }
}

if (runPull || runAll) {
  if (!cloned) {
    await pull({ dir, envVars });
  }
}

if (runConfig || runAll) {
  await prepareConfig({ dir, nodes, envVars });
}

if (runInstall || runAll) {
  await install({ dir, envVars });
}

if (runBuild || runAll) {
  await build({ dir, envVars });
}

const uploads = [];

if (runUploadToWeb || runAll) {
  uploads.push(async () => {
    await rsync(nodes.byGroups(['data']), `${dir}/oa`, '/data/oa', {
      SSHKeyPath,
    });
  });
}

if (runUploadToTask || runAll) {
  uploads.push(async () => {
    await rsync(taskNodes.all(), `${dir}/oa`, '/root/oa', { SSHKeyPath });
  });
}

await Promise.all(uploads.map((run) => run()));

const runs = [];

if (runUpdateWeb || runAll) {
  runs.push(async () => {
    const webNodes = nodes.byGroups(['web']);
    await buildAndUploadEcosystemFile(webNodes, 'web admin', {
      SSHKeyPath,
      envVars,
      dir,
      instances: 4,
    });
    await rexec(webNodes, pm2Commands, { SSHKeyPath });
  });
}

if (runUpdateAPI || runAll) {
  runs.push(async () => {
    const apiNodes = nodes.byGroups(['api']);
    await buildAndUploadEcosystemFile(apiNodes, 'api', {
      SSHKeyPath,
      envVars,
      dir,
      instances: 4,
    });
    await rexec(apiNodes, pm2Commands, { SSHKeyPath });
  });
}

if (runUpdateNext || runAll) {
  runs.push(async () => {
    const nextNodes = nodes.byGroups(['next']);

    await copyAndEditFile('next.config.js', `${dir}/next.config.js`, {
      port: envVars.OA_SERVER_PORT,
      internalPort: envVars.OA_INTERNAL_SERVER_PORT,
    });
    await sftp(nextNodes, `${dir}/next.config.js`, 'ecosystem.config.js', {
      SSHKeyPath,
    });

    await rexec(nextNodes, pm2Commands, { SSHKeyPath });
  });
}

if (runUpdateTask || runAll) {
  runs.push(async () => {
    await buildAndUploadEcosystemFile(taskNodes.all(), ['task:critical', 'task:search', 'task:aggregation', 'task:maintenance', 'task:notifications'], {
      SSHKeyPath,
      envVars,
      nodeArgs: '--max-old-space-size=4096',
      dir,
      instances: 1,
    });
    await rexec(taskNodes.all(), pm2Commands, { SSHKeyPath });
  });
}

if (runUpdateNginx || runAll) {
  runs.push(async () => {
    await prepareNginxFiles({
      dir,
      envVars,
      nodes,
    });
    await uploadNginxFilesAndReload({
      dir,
      nodes: nodes.byGroups(['nginx']),
      remoteNginxDir,
      SSHKeyPath,
    });
  });
}

await Promise.all(runs.map((run) => run()));

console.log('done');
