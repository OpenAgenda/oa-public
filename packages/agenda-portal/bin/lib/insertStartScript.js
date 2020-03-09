'use strict';

const fs = require('fs');

module.exports = () => {
  const fileStr = `${process.cwd()}/package.json`;
  const packageStr = fs.readFileSync(fileStr, 'utf-8');

  fs.writeFileSync(
    fileStr,
    packageStr.replace(
      '"dependencies": {',
      `"scripts" : {
    "start": "NODE_ENV=development browser-refresh server"
  },
  "dependencies": {`)
  );
}
