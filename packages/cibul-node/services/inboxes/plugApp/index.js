import pages from './pages.js';
import userEndpoints from './endpointRouters/user.js';
import agendaEndpoints from './endpointRouters/agenda.js';
import supportEndpoints from './endpointRouters/support.js';

export default (config, services, app) => {
  pages(app, config, services);

  return app
    .use('/agendas/:agendaUid/inbox', agendaEndpoints(config, services))
    .use('/home/inbox', userEndpoints(config, services))
    .use('/admin/support', supportEndpoints(config, services));
};
