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

  const proxy = app.get('proxy');
  const getAgendaUid = () => app.locals.agenda.uid;

  async function flush() {
    try {
      proxy.clearCache();
      const fresh = await proxy.head(getAgendaUid());
      app.locals.agenda = fresh;
    } catch (err) {
      log('Error:', err);
    }
  }

  setInterval(flush, refreshInterval);
};
