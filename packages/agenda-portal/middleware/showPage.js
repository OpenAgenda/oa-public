'use strict';

const _ = require('lodash');
const log = require('../lib/Log')('showPage');

const isStaticFilePath = require('../lib/isStaticFilePath');
const setPageProp = require('../lib/utils/setPageProp');

module.exports = (req, res, next) => {
  if (isStaticFilePath(req)) return next();

  setPageProp(req, 'pageType', 'static');

  res.render(`pages/${req.params.page}`, req.data, (err, html) => {
    if (_.get(err, 'message', '').indexOf('Failed to lookup view') !== -1) {
      next();
    } else if (err) {
      log('error', err);

      next(err);
    } else {
      res.send(html);
    }
  });
};
