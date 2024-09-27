'use strict';

const mw = require('./middleware');

function init(c, cb) {
  Promise.resolve(c)
    .then(() => {
      mw.init(module.exports, c);
    })

    .then(() => (cb ? cb() : null), cb || null);
}

module.exports = {
  init,
  mw,
};
