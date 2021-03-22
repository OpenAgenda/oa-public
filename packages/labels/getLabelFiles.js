'use strict';

const fs = require('fs');
const path = require('path');

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

function walkSync(dir) {
  const files = fs.readdirSync(path.join(__dirname, dir));
  const results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(path.join(__dirname, filePath));

    if (stat && stat.isDirectory()) {
      Array.prototype.push.apply(results, walkSync(filePath));
    } else {
      results.push(filePath);
    }
  }

  return results;
}
