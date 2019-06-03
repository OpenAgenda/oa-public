"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

module.exports = async ( { knex, imageBasePath }, id ) => {

  const {
    legacyEvent,
    event,
    location,
    articles,
    reviews,
    tags
  } = await _fetch( knex, id );

  const origin = _.find( reviews, { uid: event.agendaUid } );

  const e = {
    ..._.pick( legacyEvent, [
      'id',
      'ownerId',
      'slug',
      'createdAt',
      'updatedAt',
      'uid',
      'store'
    ] ),
    ..._.pick( event, [
      'title',
      'description',
      'freeText'
    ] ),
    ..._.pick( legacyEvent, [
      'isPublished',
      'fileKey'
    ] ),
    age: _age( legacyEvent ),
    accessibility: _accessibility( legacyEvent ),
    locations: [ {
      ..._.pick( location, [
        'id',
        'uid',
        'slug'
      ] ),
      verified: location.state === 1 ? 1 : 0,
      ..._.pick( location, [
        'name',
        'address',
        'city',
        'department',
        'region',
        'district',
      ] ),
      postcode: location.postalCode,
      ..._.pick( location, [
        'country',
        'latitude',
        'longitude',
        'updatedAt'
      ] ),
      timings: event.timings.map( t => ( {
        start: t.begin,
        end: t.end
      } ) ),
      ..._.pick( location, [
        'agendaId',
        'store',
        'eveId',
        'postalCode',
        'insee'
      ] ),
      countryCode: location.country,
      image: location.image ? imageBasePath + location.image : null,
      ..._.pick( location, [
        'description',
        'tags',
        'phone',
        'links',
        'access',
        'state',
        'timezone',
        'imageCredits'
      ] )
    } ],
    articles: articles.map( a => ( {
      ..._.pick( a, [
        'userId',
        'state',
        'featured',
        'store'
      ] ),
      review: _.pick( _.find( reviews, { id: a.reviewId } ), [
        'id',
        'uid',
        'slug',
        'title',
        'description',
        'thumbnail'
      ] ),
      tags: tags.filter( t => t.reviewArticleId === a.id ).map( t => _.pick( t, [
        'id',
        'slug',
        'label'
      ] ) ),
      reviewer: a.reviewer
    } ) ),
    origin: _.pick( origin, [
      'uid',
      'title',
      'url',
      'slug'
    ] ),
    reviewId: origin ? origin.id : null,
    ..._.pick( legacyEvent, [
      'image',
      'thumbnail',
      'credits',
      'customFields'
    ] )
  }

  return e;
}

async function _fetch( knex, id ) {

  const legacyEvent = await knex( 'event' ).first( [
    'id',
    'owner_id as ownerId',
    'slug',
    'uid',
    'store',
    'created_at as createdAt',
    'updated_at as updatedAt',
    'is_published as isPublished',
    'file_key as fileKey',
    'age_min as ageMin',
    'age_max as ageMax',
    'accessibility',
    'image',
    'image_credits as credits',
    'custom_fields as customFields'
  ] ).where( 'id', id ).then( e => e ? ( {
    ...e,
    thumbnail: e.image ? 'evtb' + e.image : null,
    customFields: ( e.customFields || '' ).length ? JSON.parse( e.customFields ) : {}
  } ) : null )

  if ( !legacyEvent ) throw new Error( 'no legacy event record' );

  const event = await knex( 'event_2' ).first( [
    'title',
    'description',
    'long_description as freeText',
    'location_uid as locationUid',
    'timings',
    'timezone',
    'agenda_uid as agendaUid'
  ] ).where( 'uid', legacyEvent.uid )
    .then( e => {

      if ( !e ) return null;

      return _.set( e, 'timings', _timings( e ) );

    } );

  if ( !event ) throw new Error( 'no event record' );

  const location = await knex( 'location' ).first( [
    'id',
    'uid',
    'slug',
    'placename as name',
    'address',
    'city',
    'department',
    'region',
    'city_district as district',
    'postal_code as postalCode',
    'country',
    'latitude',
    'longitude',
    'updated_at as updatedAt',
    'agenda_id as agendaId',
    'store',
    'eve_id as eveId',
    'insee'
  ] ).where( 'uid', event.locationUid ).then( l => l ? {
    ...l,
    ..._extractFromStore( l.store, [
      'state',
      'image',
      'description',
      'tags',
      'phone',
      'links',
      'access',
      'state',
      'timezone',
      'imageCredits'
    ], 'location' )
  } : null );

  if ( !location ) throw new Error( 'no location record' );

  const articles = await knex( 'review_article as ra' ).select( [
    'ra.id as id',
    'ra.user_id as userId',
    'ra.review_id as reviewId',
    'state',
    'ra.store as store',
    'featured',
    'rr.organization as reviewer.organization',
    'rr.store as reviewer.store'
  ] ).leftJoin( 'reviewer as rr', function() {
    this
      .on( 'ra.user_id', '=', 'rr.user_id' )
      .andOn( 'ra.review_id', '=', 'rr.review_id' );
  } ).where( 'event_id', legacyEvent.id )
    .then( articles => articles.map( a => ( {
      ...a,
      reviewer: {
        ..._extractFromStore( a[ 'reviewer.store' ], [
          [ 'custom_fields.organization', 'organization' ],
          [ 'custom_fields.contact_number', 'contactNumber' ],
          [ 'custom_fields.contact_name', 'contactName' ],
          [ 'custom_fields.contact_position', 'contactPosition' ],
          [ 'custom_fields.email', 'email' ],
        ], 'reviewer' ),
        organizationSlug: a[ 'reviewer.organization' ]
      }
    } ) ) );


knex.select('*').from('users').leftJoin('accounts', function() {
  this.on('accounts.id', '=', 'users.account_id').orOn('accounts.owner_id', '=', 'users.id')
})
  if ( !articles.length ) throw new Error( 'no review_article record' );

  const reviews = await knex( 'review' ).select( [
    'id',
    'uid',
    'slug',
    'title',
    'description',
    'image'
  ] ).whereIn( 'id', articles.map( a => a.reviewId ) ).then(
    rows => rows.map( r => ( {
      ...r,
      thumbnail: r.image ? 'rwtb' + r.image : null
    } ) )
  );

  const tags = await knex( 'review_tag as rt' ).select( [
    'rt.id as id',
    'rt.slug as slug',
    'tag as label',
    'review_article_id as reviewArticleId'
  ] ).leftJoin(
    'review_tag_article as rta',
    'rt.id',
    'rta.review_tag_id'
  ).whereIn( 'rta.review_article_id', articles.map( a => a.id ) );

  return {
    legacyEvent,
    event,
    location,
    articles,
    reviews,
    tags
  }

}


function _age( e = {} ) {

  if ( !e.ageMin && !e.ageMax ) return null;

  return {
    min: e.ageMin,
    max: e.ageMax
  }

}

function _accessibility( e = {} ) {

  return ( e.accessibility || '' ).split( ',' ).filter( a => a.length );

}

function _extractFromStore( store, fields, storeOrigin ) {

  try {

    if ( !store || !store.length ) return {};

    const parsed = JSON.parse( store );

    return fields.map( f => _.isArray( f ) ? f : [ f, f ] )
      .reduce(
        ( extract, [ from, to ] ) => _.set( extract, to, _.get( parsed, from ) ),
        {}
      );

  } catch ( e ) {
    if ( storeOrigin ) throw new Error( `invalid ${storeOrigin} store` );
    throw new VError( e, 'failed extracting values from "%s"', store );
  }

}

function _timings( e ) {

  try {
    return JSON.parse( e.timings );
  } catch ( e ) {
    throw new Error( 'invalid timings' );
  }

}
