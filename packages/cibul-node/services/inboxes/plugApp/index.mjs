import express from 'express';
import pages from './pages.mjs';
import userEndpoints from './endpointRouters/user.mjs';
import agendaEndpoints from './endpointRouters/agenda.mjs';
import supportEndpoints from './endpointRouters/support.mjs';

export default (config, services) => {
  const app = express.Router();

  pages(app, config, services);

  return app
    .use('/agendas/:agendaUid/inbox', agendaEndpoints(config, services))
    .use('/home/inbox', userEndpoints(config, services))
    .use('/admin/support', supportEndpoints(config, services));
};
