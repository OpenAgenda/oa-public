import _ from 'lodash';
import logs from '../lib/Log.js';

const log = logs('tasks/cache');

export default (app, config) => {
  const { refreshInterval } = _.assign(
    {
      refreshInterval: 60 * 60 * 1000,
    },
    config,
  );

  log('cache will be refreshed every %s seconds', refreshInterval / 1000);

  setInterval(() => {
    app.get('proxy').clearCache();
    app
      .get('proxy')
      .head(app.locals.agenda.uid)
      .then((result) => {
        app.locals.agenda = result;
      })
      .catch((err) => {
        log('Error:', err);
      });
  }, refreshInterval);
};
