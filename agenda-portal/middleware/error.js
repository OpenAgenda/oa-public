import _ from 'lodash';
import logs from '../lib/Log.js';
import pageGlobals from './pageGlobals.js';

const log = logs('middleware/error');

// eslint-disable-next-line no-unused-vars
export default (err, req, res, next) => {
  const message = _.get(err, 'response.data.error', _.get(err, 'message'));

  console.log(err);

  log('error', message || err);

  pageGlobals(req, res, () => {
    res.status(500).render(
      'error',
      _.assign(req.data || {}, {
        message: process.env.NODE_ENV === 'development' ? message : null,
      }),
    );
  });
};
