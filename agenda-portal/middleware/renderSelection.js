'use strict';

const setPageProp = require('../lib/utils/setPageProp');

module.exports = type => async (req, res) => {
  setPageProp(req, 'pageType', type);
  setPageProp(req, 'lang', res.locals.lang);

  res.render(type, req.data);
};
