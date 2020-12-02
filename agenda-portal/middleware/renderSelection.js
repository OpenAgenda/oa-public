'use strict';

const setPageProp = require('../lib/utils/setPageProp');

module.exports = type => async (req, res) => {
  setPageProp(req, 'pageType', type);

  res.render(type, req.data);
};
