'use strict';

const express = require('express');
const pages = require('./pages');

const userEndpoints = require('./endpointRouters/user');
const agendaEndpoints = require('./endpointRouters/agenda');
const supportEndpoints = require('./endpointRouters/support');

module.exports = (config, services) => {
  const app = express.Router();

  pages(app, config, services);

  return app
    .use('/agendas/:agendaUid/inbox', agendaEndpoints(config, services))
    .use('/home/inbox', userEndpoints(config, services))
    .use('/admin/support', supportEndpoints(config, services));
};
