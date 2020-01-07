'use strict';

const ih = require('immutability-helper');

module.exports = (settings, extensions) => {
  return ih(settings, {
    mappings: {
      properties: Object.keys(extensions).reduce((extended, namespace) => ({
        ...extended,
        [namespace]: { '$set' : extensions[namespace] }
      }), {})
    }
  });
}
