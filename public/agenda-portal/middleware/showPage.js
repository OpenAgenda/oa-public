import _ from 'lodash';
import logs from '../lib/Log.js';
import isStaticFilePath from '../lib/isStaticFilePath.js';
import setPageProp from '../lib/utils/setPageProp.js';

const log = logs('showPage');

export default (req, res, next) => {
  if (isStaticFilePath(req)) return next();

  setPageProp(req, 'pageType', 'static');
  setPageProp(req, 'lang', res.locals.lang);

  res.render(`pages/${req.params.page}`, req.data, (err, html) => {
    if (_.get(err, 'message', '').includes('Failed to lookup view')) {
      next();
    } else if (err) {
      log('error', err);

      next(err);
    } else {
      res.send(html);
    }
  });
};
