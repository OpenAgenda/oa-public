'use strict';

const fs = require('fs');
const path = require('path');

function walkSync(dir, basePath = __dirname) {
  const files = fs.readdirSync(path.join(basePath, dir));
  const results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(path.join(basePath, filePath));

    if (stat && stat.isDirectory()) {
      Array.prototype.push.apply(results, walkSync(filePath, basePath));
    } else {
      results.push(filePath);
    }
  }

  return results;
}

module.exports = function getLabelFiles() {
  const files = fs.readdirSync(__dirname);
  const results = [];

  for (const file of files) {
    const stats = fs.statSync(path.join(__dirname, file));

    if (stats.isDirectory() && !['node_modules', '.git', '.idea', '.crowdin', 'test', 'lib'].includes(file)) {
      Array.prototype.push.apply(results, walkSync(file));
    }
  }

  return results;
}

module.exports.walkSync = walkSync;
