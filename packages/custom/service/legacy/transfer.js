"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'legacy/transfer' );

const load = require( './load' );
const serviceCreate = require( '../create' );
const serviceUpdate = require( '../update' );
const serviceGet = require( '../get' );
const serviceRemove = require( '../remove' );

const libs = {
  categories: require( './categories' ),
  custom: require( './custom' ),
  tags: require( './tags' )
}


module.exports = _.assign( transfer, {
  parse
} );

function parse( fields, { custom, tags, category } ) {

  return _.assign(
    libs.custom.parse( fields.filter( f => f.origin === 'custom' ), custom ),
    libs.tags.parse( fields.filter( f => f.origin === 'tags' ), tags ),
    libs.categories.parse( fields.filter( f => f.origin === 'categories' ), category )
  );

}

async function transfer( formSchemaId, identifier, defaultAgendaId = null ) {

  log( 'info', 'transfering event %s legacy to %s', identifier, formSchemaId );

  const {
    agendaId,
    fields,
    eventId,
    agendaEventId,
    custom,
    categoryId
  } = await load( formSchemaId, identifier, { agendaId: defaultAgendaId } );

  const legacyTags = await libs.tags.load( agendaEventId );

  const legacyCategory = await libs.categories.load( categoryId );

  const toTransfer = parse( fields, {
    custom,
    tags: legacyTags,
    category: legacyCategory
  } );

  const emptyLegacyCustom = !_.keys( toTransfer ).length;
  const current = await serviceGet( formSchemaId, identifier );

  if ( emptyLegacyCustom && current ) {

    log( 'info', 'removing custom %s.%s', formSchemaId, identifier );

    await serviceRemove( formSchemaId, identifier );

  } else if ( emptyLegacyCustom && !current ) {

    log( 'info', 'no custom values to transfer' );

  } else if ( current ) {

    log( 'info', 'updating custom %s.%s', formSchemaId, identifier );

    await serviceUpdate( formSchemaId, identifier, toTransfer );

  } else {

    log( 'info', 'creating custom %s.%s', formSchemaId, identifier );

    await serviceCreate( formSchemaId, identifier, toTransfer );

  }

}
