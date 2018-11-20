"use strict";

const _ = require( 'lodash' );
const formSchemas = require( '@openagenda/form-schemas' );
const networks = require( '@openagenda/networks' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/middlewares/schemas' );

module.exports = async ( req, res, next ) => {

  req.schemaExtensions = [];

  if ( _.get( req, 'agenda.networkUid' ) ) {

    const network = await networks.get( _.get( req, 'agenda.networkUid' ) );

    req.schemaExtensions.push( await formSchemas.get( network.formSchemaId ) );

  }

  if ( _.get( req, 'agenda.formSchemaId' ) ) {

    req.schemaExtensions.push( await formSchemas.get( _.get( req, 'agenda.formSchemaId' ) ) );

  }

  next();

}
