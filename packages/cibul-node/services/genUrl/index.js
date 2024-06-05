'use strict';

const genUrl = require('./genUrl');

function genUrlService({ domain }) {
  const urlGenerator = genUrl({ domain });

  function abs(uri, query) {
    return urlGenerator(uri, query, {
      abs: true,
      protocol: 'https://',
    });
  }

  urlGenerator.abs = abs;

  return urlGenerator;
}

module.exports.init = genUrlService;
