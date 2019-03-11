"use strict";

const _ = require( 'lodash' );

const agendas = require( '@openagenda/agendas' );
const AgendaSchema = require( '@openagenda/agenda-schema' );

const router = AgendaSchema.router;

const getSchemas = require( './interfaces/getSchemas' );
const layouts = require( '../lib/layouts' );

module.exports = parentApp => {

  parentApp.use( '/dist/agendaSchema',
    router.dist,
    ( req, res, next ) => res.send( 404 )
  );

  parentApp.use( '/:agendaSlug/admin/schema', router );

};

module.exports.init = config => {

  router.setLayout( layouts.agendaAdmin );

  router.setService( AgendaSchema( {
    logger: config.getLogConfig( 'svc', 'agendaSchema' ),
    CDNPath: config.aws.servicesBucketPath,
    frontAppPath: process.env.NODE_ENV !== 'production' ? '/dist/agendaSchema' : null,
    interfaces: {
      getAgenda: _.partialRight( agendas.get, { includeImagePath: true, internal: true , private: null } ),
      getSchemas
    }
  } ) );

}
