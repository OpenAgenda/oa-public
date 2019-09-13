"use strict";

const _ = require( 'lodash' );

const agendas = require( '@openagenda/agendas' );
const AgendaSchema = require( '@openagenda/agenda-schema' );

const agendaSchemaRouter = AgendaSchema.router;

const cmn = require( '../../lib/commons-app' );
const getSchema = require( './interfaces/getSchema' );
const getSchemaExtensions = require( './interfaces/getSchemaExtensions' );
const setSchemaFields = require( './interfaces/setSchemaFields' );

const sessions = require( '../sessions' );
const members = require( '../members' );
const layouts = require( '../lib/layouts' );

module.exports = parentApp => {
  parentApp.use( '/dist/agendaSchema',
    agendaSchemaRouter.dist,
    ( req, res, next ) => res.send(404)
  );

  parentApp.use(
    '/:agendaSlug/admin/schema',
    sessions.middleware.ifUnlogged((req, res) => res.redirect(302, '/')),
    cmn.loadAgendaBy({ slug: 'agendaSlug' }),
    members.mw.loadAndAuthorize('administrator'),
    agendaSchemaRouter
  );
};

module.exports.init = config => {
  agendaSchemaRouter.setLayout( layouts.load( 'agendaAdmin', {
    selectedTab: 'schema',
    role: 'administrator'
  } ) );

  agendaSchemaRouter.setService( AgendaSchema( {
    logger: config.getLogConfig( 'svc', 'agendaSchema' ),
    CDNPath: config.aws.servicesBucketPath,
    frontAppPath: process.env.NODE_ENV !== 'production' ? '/dist/agendaSchema' : null,
    interfaces: {
      getAgenda: _.partialRight( agendas.get, {
        includeImagePath: true,
        internal: true ,
        private: null
      } ),
      getSchemaExtensions,
      getSchema,
      setSchemaFields
    }
  } ) );
}
