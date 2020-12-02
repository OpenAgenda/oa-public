'use strict';

const _ = require('lodash');

module.exports = (req, path, value) => {
  if (!req.pageProps) {
    req.pageProps = _.pick(req.app.locals, [
      'iframable',
      'iframeParent',
      'lang',
      'uid',
      'root'
    ]);
  }

  _.set(req.pageProps, path, value);

  req.data.pageProps = JSON.stringify(req.pageProps, null, 2);
};
