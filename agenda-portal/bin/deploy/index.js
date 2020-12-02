'use strict';

const { promisify } = require('util');
const fs = require('fs');
const ncp = promisify(require('ncp').ncp);

const readme = fs.readFileSync(`${__dirname}/README.md`);

const { term, confirm } = require('./prompt');
const insertStartScript = require('./insertStartScript');
const editServerFile = require('./editServerFile');

module.exports = async (preloaded = {}) => {
  const env = {};

  const cwd = preloaded.CURRENT_WORKING_DIRECTORY || process.cwd();

  if (!Object.keys(preloaded).length) {
    const confirmed = await confirm(readme);

    if (!confirmed) return;
  }

  env.PORTAL_AGENDA_UID = parseInt(
    preloaded.PORTAL_AGENDA_UID
      || (await term('What is the uid of your agenda?')),
    10
  );
  env.PORTAL_LANG = preloaded.PORTAL_LANG
    || (await term('Which is the main language of the portal?', {
      default: 'fr'
    }));
  env.PORTAL_KEY = preloaded.PORTAL_KEY || (await term('OpenAgenda account public key'));
  env.PORTAL_PORT = preloaded.PORTAL_PORT
    || (await term('which port do you wish to use for development?', {
      default: 3000
    }));
  env.IFRAMABLE = preloaded.IFRAMABLE;
  if (env.IFRAMABLE === undefined) {
    env.IFRAMABLE = (await confirm(
      'Is the portal going to run inside an iframe?',
      { default: false }
    ))
      ? '1'
      : '';
  }

  env.PORTAL_ROOT = preloaded.PORTAL_ROOT || `http://localhost:${env.PORTAL_PORT}`;

  if (env.IFRAMABLE === '1') {
    env.PORTAL_IFRAME_PARENT_URL = preloaded.PORTAL_IFRAME_PARENT_URL || 'http://dev.local';
  }

  await ncp(`${__dirname}/../../boot`, cwd);

  fs.writeFileSync(
    `${cwd}/.env`,
    Object.keys(env)
      .map(key => `${key}=${env[key]}`)
      .join('\n')
  );

  await insertStartScript(cwd);

  editServerFile(cwd);

  if (env.IFRAMABLE !== '1') {
    fs.unlinkSync(`${cwd}/iframe-canvas.html`);
  }
};
