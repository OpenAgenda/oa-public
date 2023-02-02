#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const tmp = require('tmp');
const JSZip = require('jszip');
const { default: Crowdin } = require('@crowdin/crowdin-api-client');
const { fork } = require('child_process');

const { CROWDIN_KEY } = process.env;

if (!CROWDIN_KEY) {
  console.log('CROWDIN_KEY is not in environment variables.');
  process.exit(1);
}

const PROJECT_ID = 316319;

const PROJECT = path.resolve(__dirname, '../..');

const rootsMap = new Map([
  ['[OpenAgenda.oa] main', '.'],
  ['[OpenAgenda.oa-public] main', 'public'],
]);

const crowdin = new Crowdin({ token: CROWDIN_KEY });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadFile(url, to) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(to);

    https.get(url, response => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Error with status code ${response.statusCode}`));
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close(resolve);
      });
    })
      .on('error', error => reject(error));
  });
}

(async () => {
  let { data: build } = await crowdin.translationsApi.buildProject(PROJECT_ID)
    .catch(e => {
      console.log('Failed to start build', e);
      process.exit(1);
    });

  if (build.status === 'inProgress') {
    console.log('Start build on Crowdin');

    let lastProgress = 0;

    while (1) {
      await sleep(1000);

      ({ data: build } = await crowdin.translationsApi.checkBuildStatus(PROJECT_ID, build.id));

      if (build.progress !== lastProgress) {
        console.log(`Build progress: ${build.progress}%`);
        lastProgress = build.progress;
      }

      if (build.status === 'finished') {
        break;
      }
    }
  }

  const { data: download } = await crowdin.translationsApi.downloadTranslations(PROJECT_ID, build.id);

  console.log('Download build');

  tmp.setGracefulCleanup();
  const tmpFile = tmp.fileSync();

  await downloadFile(download.url, tmpFile.name)
    .catch(e => {
      console.log('Cannot download:', e);
      process.exit(1);
    });

  console.log('Build downloaded');

  const archive = fs.readFileSync(tmpFile.name);
  const zip = await JSZip.loadAsync(archive);

  let fileCounter = 0;
  let translationsCounter = 0;

  for (const fileKey in zip.files) {
    const file = zip.files[fileKey];

    if (file.dir) {
      continue;
    }

    fileCounter += 1;

    const pathParts = file.name.split('/');
    const root = rootsMap.get(pathParts[0]);
    const filePath = pathParts.slice(1).join('/');

    const crowdinLabels = JSON.parse(await zip.file(file.name).async('string'));

    translationsCounter += Object.keys(crowdinLabels).length;

    let rawProjectLabels = '{}';

    try {
      rawProjectLabels = fs.readFileSync(path.join(PROJECT, root, filePath), 'utf-8');
    } catch (e) {
      console.log(`File '${file.name}' does not exists in project`);
    }

    const start = rawProjectLabels.slice(0, rawProjectLabels.indexOf('{'));
    const end = rawProjectLabels.slice(rawProjectLabels.lastIndexOf('}') + 1);
    const projectLabels = JSON.parse(rawProjectLabels);

    const labels = {
      ...projectLabels,
      ...crowdinLabels,
    };

    fs.writeFileSync(path.join(PROJECT, root, filePath), `${start}${JSON.stringify(labels, null, 2)}${end}`);
  }

  console.log(`Successfully ${translationsCounter} translations extracted in ${fileCounter} files.`);

  fork(path.join(PROJECT, 'packages/labels/.crowdin/dispatch'));

  console.log('Dispatched in package labels');
})();
