import mw from './middleware.js';

function init(c, cb) {
  Promise.resolve(c)
    .then(() => {
      mw.init(null, c);
    })

    .then(() => (cb ? cb() : null), cb || null);
}

export { init, mw };
