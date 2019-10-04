'use strict';

const fs = require('fs');

module.exports.asAsync = function(relativePath) {
  return async () => getJSON(relativePath);
}

module.exports.getJSON = function getJSON(relativePath) {
  return JSON.parse(fs.readFileSync(__dirname + '/' + relativePath +'.json', 'utf-8'));
}

module.exports.Tracker = function() {
  const calls = [];
  return Object.assign((name, returnValue) => {
    return async (...args) => {
      calls.push({ name, args });
      return typeof returnValue === 'function' ? returnValue() : returnValue;
    }
  }, { calls });
}

module.exports.write = (fxFolder, name, data) => {
  fs.writeFileSync(`${__dirname}/${fxFolder}/${name}.json`, JSON.stringify(data, null, 2), 'utf-8');
}
