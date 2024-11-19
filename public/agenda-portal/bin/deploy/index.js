import { promisify } from 'node:util';
import fs from 'node:fs';
import syncNcp from 'ncp';
import { term, confirm } from './prompt.js';
import insertScripts from './insertScripts.js';

const readme = fs.readFileSync(`${import.meta.dirname}/README.md`);

const ncp = promisify(syncNcp);

export default async (preloaded = {}) => {
  const env = {};

  const cwd = preloaded.CURRENT_WORKING_DIRECTORY || process.cwd();

  if (!Object.keys(preloaded).length) {
    const confirmed = await confirm(readme);

    if (!confirmed) return;
  }

  env.PORTAL_AGENDA_UID = parseInt(
    preloaded.PORTAL_AGENDA_UID
      || await term('What is the uid of your agenda?'),
    10,
  );
  env.PORTAL_LANG = preloaded.PORTAL_LANG
    || await term('Which is the main language of the portal?', {
      default: 'fr',
    });
  env.PORTAL_KEY = preloaded.PORTAL_KEY || await term('OpenAgenda account public key');
  env.PORTAL_PORT = preloaded.PORTAL_PORT
    || await term('which port do you wish to use for development?', {
      default: 3000,
    });
  env.PORTAL_IFRAMABLE = preloaded.PORTAL_IFRAMABLE;
  if (env.PORTAL_IFRAMABLE === undefined) {
    env.PORTAL_IFRAMABLE = await confirm(
      'Is the portal going to run inside an iframe?',
      { default: false },
    )
      ? '1'
      : '';
  }

  env.PORTAL_ROOT = preloaded.PORTAL_ROOT || `http://localhost:${env.PORTAL_PORT}`;

  if (env.PORTAL_IFRAMABLE === '1') {
    env.PORTAL_IFRAME_PARENT_URL = preloaded.PORTAL_IFRAME_PARENT_URL || 'http://dev.local';
  }

  env.PORTAL_VIEWS_FOLDER = preloaded.PORTAL_VIEWS_FOLDER || './views';
  env.PORTAL_SASS_PATH = preloaded.PORTAL_SASS_PATH || './sass/main.scss';
  env.PORTAL_JS_PATH = preloaded.PORTAL_JS_PATH || './js/main.js';
  env.PORTAL_ASSETS_FOLDER = preloaded.PORTAL_ASSETS_FOLDER || './assets';
  env.PORTAL_I18N_PATH = preloaded.PORTAL_I18N_PATH || './i18n/index.js';
  env.PORTAL_USE_AGENDA_GA_ID = preloaded.PORTAL_USE_AGENDA_GA_ID
    || (await confirm(
      'If you have a tracker set in your agenda, do you wish to enable tracking on the portal?',
    ),
    { default: false })
    ? '1'
    : '';

  await ncp(`${import.meta.dirname}/../../boot`, cwd);

  fs.writeFileSync(
    `${cwd}/.env`,
    Object.keys(env)
      .map((key) => `${key}=${env[key]}`)
      .join('\n'),
  );

  insertScripts(cwd);

  if (env.IFRAMABLE !== '1') {
    fs.unlinkSync(`${cwd}/views/pages/iframe-test-canvas.hbs`);
  }
};
