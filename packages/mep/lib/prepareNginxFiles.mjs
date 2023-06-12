import fs from 'fs';
import _ from 'lodash';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import clearDir from './clearDir.mjs';
import getNodeGroupEndpoint from './getNodeGroupEndpoint.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const renderNginxConf = _.template(await fs.promises.readFile(`${__dirname}/../nginx/nginx.conf.tpl`, 'utf-8'));

async function copyAndEditFile(src, destDir, edits = {}) {
  const srcPath = src[0] === '/' ? src : `${__dirname}/../nginx/${src}`;
  const filename = src.split('/').pop();
  let content = await fs.promises.readFile(srcPath, 'utf-8');
  
  Object.keys(edits).forEach(name => {
    content = content.replace(
      new RegExp(['\\\${', name, '\\\}'].join(''), 'g'),
      edits[name]
    );
  });

  await fs.promises.writeFile(`${destDir}/${filename}`, content, 'utf-8');
}

export default async function prepareNginxFiles({
  dir,
  nodeGroups,
  envVars,
}) {
  const {
    API_DOMAIN: APIDomain,
    DOMAIN: domain,
    OA_SERVER_PORT: serverPort,
  } = envVars;

  if ((await fs.promises.readdir(dir)).includes('nginx')) {
    await clearDir(`${dir}/nginx`);
  } else {
    await fs.promises.mkdir(`${dir}/nginx`);
  }
  await fs.promises.mkdir(`${dir}/nginx/conf.d`);

  await fs.promises.writeFile(
    `${dir}/nginx/nginx.conf`,
    renderNginxConf({
      domain,
      APIDomain,
      serverPort,
      APIEndpoint: getNodeGroupEndpoint(nodeGroups, 'api'),
      NextEndpoint: getNodeGroupEndpoint(nodeGroups, 'next'),
      WebEndpoint: getNodeGroupEndpoint(nodeGroups, 'web'),
    }),
    'utf-8'
  );

  await copyAndEditFile(`${dir}/oa/docker/nginx/server_params`, `${dir}/nginx/conf.d`);
  await copyAndEditFile('conf.d/nextjs_params', `${dir}/nginx/conf.d`);
  await copyAndEditFile('conf.d/nodejs_params', `${dir}/nginx/conf.d`);
  await copyAndEditFile('conf.d/static_params', `${dir}/nginx/conf.d`);
}