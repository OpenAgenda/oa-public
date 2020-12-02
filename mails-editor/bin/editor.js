#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const mailsRoot = path.join(__dirname, '..');
const serverDevPath = path.join(mailsRoot, 'server.js');

const args = process.argv.splice(2);
const directoryAsArgument = args[0] && fs.lstatSync(args[0]).isDirectory();

const templatesDirPath = process.env.MAILS_TEMPLATES_DIR
  || path.join(process.cwd(), directoryAsArgument ? args[0] : 'templates');

const additionalArgs = args.splice(directoryAsArgument ? 1 : 0);

const nodemonArgs = [
  serverDevPath,
  '-w',
  mailsRoot,
  '-w',
  templatesDirPath,
  '-e',
  'js,json,mjml,ejs',
  ...additionalArgs,
];

spawn('nodemon', nodemonArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    MAILS_TEMPLATES_DIR: templatesDirPath,
  },
});
