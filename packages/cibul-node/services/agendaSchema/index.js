"use strict";

const _ = require('lodash');

const AgendaSchema = require('@openagenda/agenda-schema');

const agendaSchemaRouter = AgendaSchema.router;

const cmn = require('../../lib/commons-app');
const getSchema = require('./interfaces/getSchema');
const getSchemaExtensions = require('./interfaces/getSchemaExtensions');
const setSchemaFields = require('./interfaces/setSchemaFields');

const layouts = require( '../lib/layouts' );
const config = require( '../../config' );

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

  parentApp.use('/dist/agendaSchema',
    agendaSchemaRouter.dist,
    (req, res, next) => res.send(404)
  );

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

module.exports.init = (config, services) => {
  const {
    agendas
  } = services;

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
        internal: true ,
        private: null
      }),
      getSchemaExtensions: getSchemaExtensions.bind(null, services),
      getSchema: getSchema.bind(null, services),
      setSchemaFields: setSchemaFields.bind(null, services)
    }
  }));
}
