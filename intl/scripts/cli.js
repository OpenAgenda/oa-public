#!/usr/bin/env node

'use strict';

// eslint-disable-next-line no-unused-expressions
require('yargs/yargs')(process.argv.slice(2))
  .command(require('./default'))
  .command(require('./extract'))
  .command(require('./compile'))
  .wrap(null)
  .locale('en')
  .scriptName('oa-intl')
  .help()
  .argv;
