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
      default: 'fr',
    }));
  env.PORTAL_KEY = preloaded.PORTAL_KEY || (await term('OpenAgenda account public key'));
  env.PORTAL_PORT = preloaded.PORTAL_PORT
    || (await term('which port do you wish to use for development?', {
      default: 3000,
    }));
  env.PORTAL_IFRAMABLE = preloaded.PORTAL_IFRAMABLE;
  if (env.PORTAL_IFRAMABLE === undefined) {
    env.PORTAL_IFRAMABLE = (await confirm(
      'Is the portal going to run inside an iframe?',
      { default: false }
    ))
      ? '1'
      : '';
  }

  env.PORTAL_ROOT = preloaded.PORTAL_ROOT || `http://localhost:${env.PORTAL_PORT}`;

  if (env.PORTAL_IFRAMABLE === '1') {
    env.PORTAL_IFRAME_PARENT_URL = preloaded.PORTAL_IFRAME_PARENT_URL || 'http://dev.local';
  }

  env.PORTAL_VIEWS_FOLDER = preloaded.PORTAL_VIEWS_FOLDER || './views';
  env.PORTAL_SASS_PATH = preloaded.PORTAL_SASS_PATH || './sass/main.scss';
  env.PORTAL_ASSETS_FOLDER = preloaded.PORTAL_ASSETS_FOLDER || './assets';
  env.PORTAL_I18N_FOLDER = preloaded.PORTAL_I18N_FOLDER || './i18n';

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
    fs.unlinkSync(`${cwd}/assets/iframe-test-canvas.html`);
  }
};
