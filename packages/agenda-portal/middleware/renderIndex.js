'use strict';

const _ = require('lodash');

const setPageProp = require('../lib/utils/setPageProp');

module.exports = async (req, res) => {
  if (req.query.data !== undefined && process.env.NODE_ENV === 'development') {
    return res.json(_.assign(req.data, req.app.locals));
  }

  setPageProp(req, 'pageType', 'list');

  res.render('index', req.data);
};
