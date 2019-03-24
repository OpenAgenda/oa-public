"use strict";

const _ = require( 'lodash' );
const eventSchema = require( '@openagenda/event-form/build/schema' );
const networks = require( '@openagenda/networks' );

const log = require( '@openagenda/logs' )( 'events/interfaces/getSchemaExtensions' );

// no ifs here. agenda-schema bislogic is in agenda-schema

module.exports = async agenda => {

  const networkUid = _.get( agenda, 'networkUid' );

  const network = networkUid ? ( await networks.get( { uid: networkUid } ) ) : null;

  const networkFormSchemaId = _.get( network, 'form_schema_id' );

  return {
    event: _.assign( { id: -1 }, eventSchema( {} ) ),
    network: networkFormSchemaId ? await formSchemas.get( networkFormSchemaId ) : null
  };

}
