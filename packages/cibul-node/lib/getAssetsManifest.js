'use strict';

const fs = require('node:fs');

const statsPath = require.resolve('@openagenda/cibul-templates/dist/js/assets-manifest.json');
const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));

module.exports = async function getAssetsManifest() {
  if (process.env.NODE_ENV === 'development') {
    // can change with hot reload
    return JSON.parse(await fs.promises.readFile(statsPath, 'utf-8'));
  }

  return stats;
};
