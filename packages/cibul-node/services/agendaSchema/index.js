'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/agendaSchema');

const AgendaSchema = require('@openagenda/agenda-schema');

const agendaSchemaRouter = AgendaSchema.router;

const layouts = require('../lib/layouts');
const config = require('../../config');
const getSchema = require('./interfaces/getSchema');
const getSchemaExtensions = require('./interfaces/getSchemaExtensions');
const setSchemaFields = require('./interfaces/setSchemaFields');

function layoutData(req, res, next) {
  req.layoutData = req.cookies.translateMode ? {
    scripts: {
      top: [
        { body: 'window._jipt = [[\'project\', \'openagenda\']];' },
        { src: '//cdn.crowdin.com/jipt/jipt.js' }
      ]
    }
  } : {};

  req.layoutData.translateMode = Boolean(req.cookies.translateMode);
  req.layoutData.isTranslator = req.user?.uid && config.translators.includes(req.user.uid);

  return next();
}

module.exports = parentApp => {
  const {
    agendas,
    members,
    sessions
  } = parentApp.services;

  parentApp.use('/dist/agendaSchema', [
    agendaSchemaRouter.dist,
    (req, res) => res.send(404)
  ]);

  parentApp.use(
    '/:agendaSlug/admin/schema',
    sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
    agendas.mw.load,
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadAndAuthorize('administrator'),
    layoutData,
    agendaSchemaRouter
  );
};

module.exports.init = (_config, services) => {
  const {
    agendas,
    queues
  } = services;

  const queue = queues('agendaSchema');

  queue.register({
    setSchemaFields: setSchemaFields.bind(null, services)
  });

  queue.on('error', (task, args, err) => log('error', 'task %s error', task, err));

  agendaSchemaRouter.setLayout(layouts.load('agendaAdmin', {
    selectedTab: 'schema',
    role: 'administrator'
  }));

  agendaSchemaRouter.setService(AgendaSchema({
    logger: config.getLogConfig('svc', 'agendaSchema'),
    CDNPath: config.aws.servicesBucketPath,
    frontAppPath: process.env.NODE_ENV !== 'production' ? '/dist/agendaSchema' : null,
    interfaces: {
      getAgenda: _.partialRight(agendas.get, {
        includeImagePath: true,
        internal: true,
        private: null
      }),
      getSchemaExtensions: getSchemaExtensions.bind(null, services),
      getSchema: getSchema.bind(null, services),
      setSchemaFields: (agenda, fields) => queue('setSchemaFields', agenda.uid, fields)
    }
  }));

  return {
    task: async (options = {}) => {
      const {
        reset = false
      } = options;

      if (reset) {
        await queue.clear();
      }

      queue.run();
    }
  };
};
