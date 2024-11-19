import setPageProp from '../lib/utils/setPageProp.js';

export default (type) => async (req, res) => {
  setPageProp(req, 'pageType', type);
  setPageProp(req, 'lang', res.locals.lang);

  res.render(type, req.data);
};
