"use strict";

const _ = require( 'lodash' );

const logger = require( '@openagenda/logs' );

const manifest = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/../client/dist/manifest.json', 'utf-8' ) );

const name = JSON.parse(
  require( 'fs' ).readFileSync( __dirname + '/../package.json', 'utf-8' )
).name.split( '/' ).pop();

module.exports = _.assign( ( config = {} ) => {

  const load = loadServiceResources.bind( null, config.interfaces );

  return {
    name,
    config,
    loadAppResources: loadAppResources.bind( null, load ),
    setSchemaFields: setSchemaFields.bind( null, load, config.interfaces.setSchemaFields )
  };

}, {
  router: require( './router' )
} );

async function setSchemaFields( load, setSchemaFields, agendaIdentifiers, update ) {

  const { agenda, schema, extensions } = await load( agendaIdentifiers );

  return setSchemaFields( agenda, update );

}

async function loadAppResources( load, agendaIdentifiers ) {

  const { agenda, schema, extensions } = await load( agendaIdentifiers );

  return {
    agenda: _.pick( agenda, [ 'slug', 'uid', 'title' ] ),
    schema,
    maxFields: _.get( agenda, 'credentials.premiumCustomFields' ) ? 10 : 1,
    extensions,
    editableExtensions: !!_.get( agenda, 'credentials.premiumCustomFields' )
  }

}


async function loadServiceResources( { getAgenda, getSchema, getSchemaExtensions }, agendaIdentifiers ) {

  const agenda = await getAgenda( agendaIdentifiers );

  if ( !agenda ) throw new Error( 'Could not find agenda' );

  const schema = await getSchema( agenda );

  const extensions = await getSchemaExtensions( agenda );

  return {
    agenda,
    schema,
    extensions
  };

}
