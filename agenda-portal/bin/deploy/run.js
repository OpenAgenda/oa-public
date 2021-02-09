#! /usr/bin/env node

'use strict';

const deploy = require('./index');

(async () => {
  try {
    await deploy();
  } catch (e) {
    console.log('deploy failed');
    console.log(e);
  }
  process.exit();
})();
