#!/usr/bin/env node

import deploy from './index.js';

try {
  await deploy();
} catch (e) {
  console.log('deploy failed');
  console.log(e);
}
process.exit();
