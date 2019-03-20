"use strict";

const _ = require( 'lodash' );

const agendas = require( '@openagenda/agendas' );
const AgendaSchema = require( '@openagenda/agenda-schema' );

const agendaSchemaRouter = AgendaSchema.router;

const getSchemaConfiguration = require( './interfaces/getSchemaConfiguration' );
const setSchema = require( './interfaces/setSchema' );
const layouts = require( '../lib/layouts' );

module.exports = parentApp => {

  parentApp.use( '/dist/agendaSchema',
    agendaSchemaRouter.dist,
    ( req, res, next ) => res.send( 404 )
  );

  parentApp.use( '/:agendaSlug/admin/schema', agendaSchemaRouter );

};

module.exports.init = config => {

  agendaSchemaRouter.setLayout( layouts.agendaAdmin );

  agendaSchemaRouter.setService( AgendaSchema( {
    logger: config.getLogConfig( 'svc', 'agendaSchema' ),
    CDNPath: config.aws.servicesBucketPath,
    frontAppPath: process.env.NODE_ENV !== 'production' ? '/dist/agendaSchema' : null,
    interfaces: {
      getAgenda: _.partialRight( agendas.get, { includeImagePath: true, internal: true , private: null } ),
      getSchemaConfiguration,
      setSchema
    }
  } ) );

}
