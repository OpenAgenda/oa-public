'use strict';

const express = require('express');
const pages = require('./pages');

const userEndpoints = require('./endpointRouters/user');
const agendaEndpoints = require('./endpointRouters/agenda');
const supportEndpoints = require('./endpointRouters/support');

const endpointRouters = {
  user: userEndpoints,
  agenda: agendaEndpoints,
  support: supportEndpoints
};

module.exports = (config, services) => {
  const app = express();

  pages(app, config, services);

  return app
    .use('/agendas/:agendaUid/inbox', endpointRouters.agenda(config, services))
    .use('/home/inbox', endpointRouters.user(config, services))
    .use('/admin/support', endpointRouters.support(config, services));
};
