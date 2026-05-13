#!/usr/bin/env node

import yargs from 'yargs/yargs';
import defaultCmd from './default.js';
import extract from './extract.js';
import compile from './compile.js';

// eslint-disable-next-line no-unused-expressions
yargs(process.argv.slice(2))
  .command(defaultCmd)
  .command(extract)
  .command(compile)
  .wrap(null)
  .locale('en')
  .scriptName('oa-intl')
  .help().argv;
