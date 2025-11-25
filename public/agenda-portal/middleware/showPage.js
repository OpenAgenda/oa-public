import logs from '../lib/Log.js';
import isStaticFilePath from '../lib/isStaticFilePath.js';
import setPageProp from '../lib/utils/setPageProp.js';

const log = logs('showPage');

export default (req, res, next) => {
  if (isStaticFilePath(req)) return next();

  setPageProp(req, 'pageType', 'static');
  setPageProp(req, 'lang', res.locals.lang);

  if (/\./.test(req.params.page)) {
    log('unhandled separator "." for %s', req.params.page);
    next();
    return;
  }

  res.render(`pages/${req.params.page}`, req.data, (err, html) => {
    if (!err) {
      res.send(html);
      return;
    }
    if ((err?.message ?? '').includes('Failed to lookup view')) {
      log('page %s does not exist', req.params.page);
      next();
      return;
    }
    log('error', err);
    next(err);
  });
};
