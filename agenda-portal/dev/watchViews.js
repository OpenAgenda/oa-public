'use strict';

const clientRefresher = require('browser-refresh-client');

module.exports = function watchViews(hbs) {
  clientRefresher
    .enableSpecialReload('*.hbs')
    .onFileModified(path => delete hbs.cache[path]);
};
