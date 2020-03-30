#! /usr/bin/env node

'use strict';

const { promisify } = require('util');
const fs = require('fs');
const ncp = promisify(require('ncp').ncp);

const { term, confirm } = require('../lib/prompt');
const insertStartScript = require('./lib/insertStartScript');
const insertLangAndUid = require('./lib/insertLangAndUid');

(async () => {
  const confirmed = await confirm(`
In order to proceed, you will need:

 * An OpenAgenda agenda uid
 * An OpenAgenda account public key

Continue?`);

  if (!confirmed) return;

  const agendaUid = await term('What is the uid of your agenda?');
  const lang = await term('Which is the main language of the portal?', { default: 'fr' });
  const key = await term('OpenAgenda account public key');
  const iframable = await confirm('Is the portal going to run inside an iframe?', { default: false });

  fs.writeFileSync(`${process.cwd()}/oa.key`, key);

  await ncp(`${__dirname}/../boot`, process.cwd());

  await insertStartScript();

  insertLangAndUid(agendaUid, lang, iframable);

  if (!iframable) {
    fs.unlinkSync(`${process.cwd()}/iframe-canvas.html`);
  }
})();
