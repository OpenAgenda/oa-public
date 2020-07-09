'use strict';

const setPageProp = require('../lib/utils/setPageProp');

module.exports = async (req, res) => {
  setPageProp(req, 'pageType', 'preview');

  res.render('preview', req.data);
};
