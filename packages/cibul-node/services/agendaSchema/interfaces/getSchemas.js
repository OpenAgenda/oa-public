"use strict";

const _ = require( 'lodash' );
const formSchemas = require( '@openagenda/form-schemas' );
const networks = require( '@openagenda/networks' );
const labels = require( '@openagenda/labels/agenda-admin/agendaSchema' );
const log = require( '@openagenda/logs' )( 'events/interfaces/getSchemas' );

const eventSchema = require( '@openagenda/event-form/build/schema' );

module.exports = async agenda => {

  const agendaFormSchemaId = _.get( agenda, 'formSchemaId' );
  const networkUid = _.get( agenda, 'networkUid' );

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

  log( 'info', agendaFormSchemaId ? 'agenda schema is loaded' : 'no agenda schema is defined' );

  return {
    schema,
    extensions
  }

}
