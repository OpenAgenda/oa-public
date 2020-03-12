'use strict';

const fs = require('fs');

function getJSON(relativePath) {
  return JSON.parse(
    fs.readFileSync(`${__dirname}/${relativePath}.json`, 'utf-8')
  );
}

module.exports.getJSON = getJSON;

module.exports.asAsync = function asAsync(relativePath) {
  return async () => getJSON(relativePath);
};

module.exports.Tracker = function Tracker() {
  const calls = [];
  return Object.assign(
    (name, returnValue) => async (...args) => {
      calls.push({ name, args });
      return typeof returnValue === 'function' ? returnValue() : returnValue;
    },
    { calls }
  );
};

module.exports.write = (fxFolder, name, data) => {
  fs.writeFileSync(
    `${__dirname}/${fxFolder}/${name}.json`,
    JSON.stringify(data, null, 2),
    'utf-8'
  );
};
