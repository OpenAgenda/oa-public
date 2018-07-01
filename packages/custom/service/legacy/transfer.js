"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'legacy/transfer' );

const load = require( './load' );
const serviceCreate = require( '../create' );
const serviceUpdate = require( '../update' );
const serviceGet = require( '../get' );
const serviceRemove = require( '../remove' );

const categories = require( './categories' );
const customFields = require( './customFields' );
const tags = require( './tags' );

module.exports = async ( formSchemaId, identifier ) => {

  const {
    fields,
    agendaId,
    eventId,
    agendaEventId,
    custom,
    categoryId
  } = await load( formSchemaId, identifier );

  const toTransfer = _.assign( 
    await customFields.parse( fields, custom ),
    await tags.parse( agendaEventId, fields.filter( f => f.origin === 'tags' ) ),
    await categories.parse( categoryId, fields.filter( f => f.origin === 'categories' ) )
  );

  const emptyLegacyCustom = _.keys( toTransfer ).length;
  const current = await serviceGet( formSchemaId, identifier );

  if ( emptyLegacyCustom && current ) {

    log( 'removing custom %s.%s', formSchemaId, identifier );

    await serviceRemove( formSchemaId, identifier );

  } else if ( emptyLegacyCustom && !current ) {

    log( 'no custom values to transfer' );

  } else if ( current ) {

    log( 'updating custom %s.%s', formSchemaId, identifier );

    await serviceUpdate( formSchemaId, identifier, toTransfer );

  } else {

    log( 'creating custom %s.%s', formSchemaId, identifier );

    await serviceCreate( formSchemaId, identifier, toTransfer );

  }

}