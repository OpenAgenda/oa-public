"use strict";

const _ = require( 'lodash' );
const formSchemas = require( '@openagenda/form-schemas' );
const networks = require( '@openagenda/networks' );
const labels = require( '@openagenda/labels/agenda-admin/agendaSchema' );

const eventSchema = require( '@openagenda/event-form/build/schema' );

module.exports = async agenda => {

  const agendaFormSchemaId = _.get( agenda, 'form_schema_id' );
  const networkUid = _.get( agenda, 'network_uid' );

  const network = networkUid ? ( await networks.get( { uid: networkUid } ) ) : null;

  const networkFormSchemaId = _.get( network, 'form_schema_id' );

  const extensions = [ {
    schema: _.assign( { id: -1 }, eventSchema( {} ) ),
    info: {
      label: labels.event,
      detail: labels.eventDetail
    }
  } ];

  if ( networkFormSchemaId ) {

    extensions.push( {
      schema: _.assign( { id: networkFormSchemaId }, await formSchemas.get( networkFormSchemaId ) ),
      info: {
        label: labels.network,
        detail: labels.networkDetail
      }
    } );

  }

  const schema = agendaFormSchemaId ? _.assign( { id: agendaFormSchemaId }, await formSchemas.get( agendaFormSchemaId ) ) : null;

  return {
    schema,
    extensions
  }

}
