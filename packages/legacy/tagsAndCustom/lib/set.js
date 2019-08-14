"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'set' );

module.exports = async ( { knex }, agendaId, eventUid, schemas = [], customValues = [] ) => {

  log( 'info', 'setting tags and custom for agenda id %s, event uid %s', agendaId, eventUid );

  const eventId = await knex( 'event' )
    .first( 'id' )
    .where( 'uid', eventUid )
    .then( r => _.get( r, 'id' ) );

  log( 'retrieve event id %s', eventId );

  const reviewArticleId = await knex( 'review_article' )
    .first( 'id' )
    .where( { review_id: agendaId, event_id: eventId } )
    .then( r => r ? r.id : null );

  if ( reviewArticleId === null ) {
    throw new Error( 'no review_article ref could be retrieved' );
  }

  const fieldValueMap = schemas
    .map( ( s, i ) => ( { schema: s, values: customValues[ i ] } ) )
    .filter( sv => !!sv.schema )
    .reduce( ( fieldValueMap, sv ) => fieldValueMap.concat(
      sv.schema.fields.filter( f => Object.keys( sv.values ).includes( f.field ) )
        .map( f => ( {
          field: f,
          value: sv.values[ f.field ],
          schema: sv.schema
        } ) )
  ), [] );

  await _setTags( knex, agendaId, reviewArticleId, fieldValueMap );

  await _setCustomValues( knex, eventId, fieldValueMap );

  await _setCategories( knex, agendaId, reviewArticleId, fieldValueMap )

}

async function _setCustomValues( knex, eventId, fieldValueMap ) {

  log( 'setting custom values for event id %s', eventId );

  const legacyCustom = fieldValueMap
    .filter( mapItem => mapItem.field.origin === 'custom' )
    .map( _labelizeOptionedCustomValues )
    .map( _mapFileCustomValues )
    .reduce( ( obj, mapItem ) => _.set( obj, mapItem.field.field, mapItem.value ), {} );

  const current = JSON.parse( _.first( await knex( 'event' )
    .pluck( 'custom_fields' )
    .where( 'id', eventId ) ) || '{}' );

  await knex( 'event' ).update( {
    custom_fields: JSON.stringify( Object.assign( current, legacyCustom ) )
  } ).where( 'id', eventId );

}

async function _setCategories( knex, agendaId, reviewArticleId, fieldValueMap ) {

  log( 'setting categories for agenda id %s, raId %s', agendaId, reviewArticleId );

  const categorySet = await knex( 'category_set' )
    .first( 'store' )
    .where( 'id', agendaId )
    .then( r => JSON.parse( _.get( r, 'store', '{"categories":[]}' ) ) );

  if ( !categorySet ) return;

  const categoryItem = _.first(
    fieldValueMap.filter( mapItem => mapItem.field.origin === 'categories' )
  );

  const label = categoryItem ? _optionFlatLabel(
    _.find( categoryItem.field.options, { id: categoryItem.value } )
  ) : null;

  const categoryId = _.get(
    categorySet.categories.filter( c => c.label === label ), '0.id', null
  );

  await knex( 'review_article' ).update( {
    category_id: categoryId
  } ).where( 'id', reviewArticleId );

}

function _optionFlatLabel( option ) {

  if ( !_.get( option, 'label' ) ) return;

  if ( _.isString( option.label ) ) {
    return option.label;
  }

  return option.label[ _.first( _.keys( option.label ) ) ];
}

async function _setTags( knex, agendaId, reviewArticleId, fieldValueMap ) {

  log( 'info', 'setting tags for agenda id %s, raId %s', agendaId, reviewArticleId );

  const tagSet = await knex( 'tag_set' )
    .first( 'store' )
    .where( 'id', agendaId )
    .then( r => JSON.parse( _.get( r, 'store', '{"groups":[]}' ) ) );

  const tagSetTags = _.flatten( tagSet.groups.map( g => g.tags ) );

  if ( tagSetTags.filter( t => !t.schemaOptionId ).length ) {
    log( 'warn', 'tags of tagset %s do not all have their schemaOptionIds' );
  }

  const matchingTags = fieldValueMap
    .filter( f => f.field.options && ( ( f.field.origin || 'tags' ) === 'tags' ) )
    .filter( f => f.value )
    .reduce( ( matchingTags, mapItem ) => matchingTags
      .concat( [].concat( mapItem.value )
        .filter( v => !!v )
        .map( v => [ mapItem.schema.id, v ].join( '.' ) )
      ), [] )
    .map( schemaOptionId => {
      const tag = _.find( tagSetTags, { schemaOptionId } );
      if ( !tag ) log( 'warn', 'schema option does not have a matching tag', schemaOptionId );
      return tag;
    } ).filter( tag => !!tag );

  log( 'info', 'identified %s matching tags', matchingTags.length );

  await knex( 'review_tag_article' )
    .where( 'review_article_id', reviewArticleId )
    .delete();

  await knex( 'review_tag_article' )
    .insert( matchingTags.map( t => ( {
      review_article_id: reviewArticleId,
      review_tag_id: t.id,
      created_at: new Date,
      updated_at: new Date
    } ) ) );

}

function _mapFileCustomValues( mapItem ) {

  if ( mapItem.field.fieldType === 'file' ) {
    return Object.assign( mapItem, {
      value: {
        name: mapItem.value.originalName,
        uploaded: mapItem.value.filename
      }
    } );
  } else if ( mapItem.field.fieldType === 'image' ) {
    return Object.assign( mapItem, {
      value: mapItem.value.filename
    } );
  }

  return mapItem;

}

function _labelizeOptionedCustomValues( mapItem ) {

  if ( !mapItem.field.options ) return mapItem;

  const _labelOf = value => _.get( _.find( mapItem.field.options, { id: value } ), 'value' );

  if ( _.isArray( mapItem.value ) ) {
    return Object.assign( mapItem, { value: mapItem.value.map( _labelOf ) } )
  }

  return Object.assign( mapItem, { value: _labelOf( mapItem.value ) } )
}
