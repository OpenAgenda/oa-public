import fs from 'node:fs';
import rimraf from 'rimraf';
import deploy from '../bin/deploy/index.js';

const cwd = `${import.meta.dirname}/deploy`;

describe('22 - deploy script', () => {
  afterAll(() => {
    try {
      rimraf.sync(cwd);
    } catch (e) {
      console.log(e);
    }
  });

  beforeAll(() => {
    if (!fs.existsSync(cwd)) {
      fs.mkdirSync(cwd);
    }

    fs.writeFileSync(
      `${cwd}/package.json`,
      `{
  "dependencies": {
  }
}`,
    );
  });

  beforeAll(async () => {
    await deploy({
      CURRENT_WORKING_DIRECTORY: cwd,
      PORTAL_AGENDA_UID: '123456789',
      PORTAL_LANG: 'fr',
      PORTAL_KEY: 'myoaaccountkey',
      PORTAL_PORT: '3000',
      PORTAL_IFRAMABLE: '1',
      PORTAL_USE_AGENDA_GA_ID: '1',
    });
  });

  test('@openagenda/agenda-portal is set in server.js file', () => {
    expect(
      fs
        .readFileSync(`${cwd}/server.js`, 'utf-8')
        .indexOf("import Portal from '@openagenda/agenda-portal'"),
    ).not.toEqual(-1);
  });

  test('@openagenda/agenda-portal/lib/Log is set in server.js file', () => {
    expect(
      fs
        .readFileSync(`${cwd}/server.js`, 'utf-8')
        .indexOf("import logs from '@openagenda/agenda-portal/lib/Log'"),
    ).not.toEqual(-1);
  });

  test('.env file is loaded in working directory', () => {
    expect(fs.readFileSync(`${cwd}/.env`, 'utf-8'))
      .toEqual(`PORTAL_AGENDA_UID=123456789
PORTAL_LANG=fr
PORTAL_KEY=myoaaccountkey
PORTAL_PORT=3000
PORTAL_IFRAMABLE=1
PORTAL_ROOT=http://localhost:3000
PORTAL_IFRAME_PARENT_URL=http://dev.local
PORTAL_VIEWS_FOLDER=./views
PORTAL_SASS_PATH=./sass/main.scss
PORTAL_JS_PATH=./js/main.js
PORTAL_ASSETS_FOLDER=./assets
PORTAL_I18N_PATH=./i18n/index.js
PORTAL_USE_AGENDA_GA_ID=1`);
  });
});
