'use strict';

const express = require('express');

const pages = require('./pages');
const endpointRouters = {
  user: require('./endpointRouters/user'),
  agenda: require('./endpointRouters/agenda'),
  support: require('./endpointRouters/support')
}

module.exports = (config, services) => {
  const app = express();

  pages(app, config, services);

  return app
    .use('/agendas/:agendaUid/inbox', endpointRouters.agenda(config, services))
    .use('/home/inbox', endpointRouters.user(config, services))
    .use('/admin/support', endpointRouters.support(config, services));
}
