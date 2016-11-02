"use strict";

const w = require( 'when' );

const knexLib = require( 'knex' );

const utils = require( 'utils' );

const validate = require( './validate' );

const sUtils = require( 'service-utils' );

const moment = require( 'moment-timezone' );

let knex, schemas, service;

module.exports = Object.assign( { 
  init,
  get,
  transfer
} );


function transfer( identifiers, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  let result = {
    transfered: false
  }

  get( identifiers, options, ( err, event, r ) => {

    if ( err ) return cb( err );

    result.valid = r.valid;

    if ( !result.valid ) {

      return cb( null, utils.extend( result, r ) );

    }

    service.set( event, ( err, r ) => {

      if ( err ) return cb( err );

      result.transfered = r.success;

      cb( null, utils.extend( result, r ) );

    } );

  } )

}


function get( identifiers, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  w( utils.extend( {
    identifiers
  }, options, {
    fields: {
      event: [ 
        'id', 'uid', 'slug', 
        'created_at', 'updated_at', 
        'age_min', 'age_max', 'image', 
        'accessibility', 'is_published',
        'store', 'owner_id'
      ],
      eventTranslations: [ 'title', 'description', 'free_text', 'tags', 'lang' ],
      eventLocation: [ 'id', 'location_id', 'ticket_link' ],
      eventLocationTranslations: [ 'pricing_info', 'lang' ],
      location: [ 'id', 'uid', 'store' ],
      user: [ 'uid' ],
      agendaEvents: [ 'review_id' ],
      agendas: [ 'uid' ],
      occurrences: [ 'date', 'time_start', 'time_end' ]
    },
    entries: {
      event: null,
      eventTranslations: [],
      eventLocation: null,
      eventLocationTranslations: [],
      location: null,
      user: null,
      agendaEvents: [],
      agendas: []
    },
    errors: [],
    data: utils.extend( {}, validate.default ),
    clean: false
  } ) )

  .then( sUtils.identifiers.clean() )

  .then( _getEvent )

  .then( _getEventTranslations )

  .then( _getEventLocation )

  .then( _getEventLocationTranslations )

  .then( _getAgendaEvents )

  .then( _getAgendas )

  .then( _getLocation )

  .then( _getOccurrences )

  .then( _getOwner )

  .then( _revalidate )

  .done( v => {
    
    cb( null, v.clean ? v.clean : v.data, {
      entries: v.entries,
      valid: !!v.clean,
      errors: v.errors
    } );

  }, cb );

}


/**
 * filter out invalid data in non-essential fields
 */
function _revalidate( v ) {

  let redo = false;

  v.errors = [];

  try {

    v.clean = validate( v.data );

  } catch( e ) {

    v.errors = e;

  }

  if ( v.errors.map( e => e.field ).indexOf( 'registration' ) !== -1 ) {

    redo = true;

    v.data.registration = [];
    
  }


  if ( redo ) {
    
    return _revalidate( v );

  }

  return v;

}


function _getOwner( v ) {

  return knex( schemas.user )

  .select( v.fields.user )

  .where( 'id', v.entries.event.owner_id )

  .then( rows => {

    if ( !rows.length ) return v;

    v.entries.user = rows[ 0 ];

    return v;

  } )

  .then( v => {

    v.data.ownerUid = v.entries.user.uid;

    return v;

  } );

}


function _getLocation( v ) {

  if ( !v.entries.eventLocation ) return v;

  return knex( schemas.location )

  .select( v.fields.location )

  .where( 'id', v.entries.eventLocation.location_id )

  .then( rows => {

    if ( !rows.length ) return v;

    v.entries.location = rows[ 0 ];

    return v;

  } )

  .then( v => {

    if ( !v.entries.location ) return v;

    v.data.locationUid = v.entries.location.uid;

    v.data.timezone = _extractTimezone( v.entries.location.store );

    return v;

  } );

}


function _getOccurrences( v ) {

  if ( !v.entries.location ) return v;

  return knex( schemas.occurrence )

  .select( v.fields.occurrence )

  .where( 'event_id', v.entries.event.id )

  .then( rows => {

    if ( !rows.length ) return v;

    v.entries.occurrences = rows;

    return v;

  } )

  .then( v => {

    v.data.timings = v.entries.occurrences

    .sort( ( a, b ) => {

      if ( new Date( a.date + 'T' + a.time_start ) < new Date( a.date + 'T' + a.time_end ) ) {

        return -1;

      } else {

        return 1;

      }

    } )

    .map( o => {

      return {
        begin: _readOccurrenceTime( o, 'time_start', v.data.timezone ),
        end: _readOccurrenceTime( o, 'time_end', v.data.timezone )
      }

    } );

    return v;

  } );

}


function _readOccurrenceTime( o, t, timezone ) {

  return new Date( moment.tz( moment( o.date ).format( 'YYYY-MM-DD' ) + ' ' + o[ t ], timezone ).format() );

}


function _getAgendas( v ) {

  if ( v.entries.agendaEvents.length !== 1 ) return v;

  return knex( schemas.agenda )

  .select( v.fields.agenda )

  .whereIn( 'id', v.entries.agendaEvents.map( ae => ae.review_id ) )

  .then( rows => {

    v.entries.agendas = rows;

    return v;

  } )

  .then( v => {

    if ( !v.entries.agendas.length ) return v;

    v.data.agendaUid = v.entries.agendas[ 0 ].uid;

    return v;

  } );

}


function _getAgendaEvents( v ) {

  return knex( schemas.agendaEvent )

  .select( v.fields.agendaEvent )

  .where( {
    event_id: v.entries.event.id
  } )

  .then( rows => {

    v.entries.agendaEvents = rows;

    return v;

  } );

}


function _getEventLocationTranslations( v ) {

  return knex( schemas.eventLocationTranslation )

  .select( v.fields.eventLocationTranslations )

  .where( { id: v.entries.eventLocation.id } )

  .then( rows => {

    v.entries.eventLocationTranslations = rows;

    return v;

  } )

  .then( v => {

    v.data.conditions = {};

    v.entries.eventLocationTranslations.forEach( r => {

      if ( !r.pricing_info || !r.pricing_info.length ) return;

      v.data.conditions[ r.lang ] = r.pricing_info;

    } );

    return v;  

  } );

}


function _getEventLocation( v ) {

  return knex( schemas.eventLocation )

  .select( v.fields.eventLocation )

  .where( { event_id: v.entries.event.id } )

  .then( rows => {

    v.entries.eventLocation = rows.length ? rows[ 0 ] : null;

    return v;

  } )

  .then( v => {

    v.data.registration = ( v.entries.eventLocation.ticket_link || '' ).split( ',' ).map( v => v.trim() ).filter( v => v.length );

    return v;

  } );

}


function _getEventTranslations( v ) {

  return knex( schemas.eventTranslation )

  .select( v.fields.eventTranslations )

  .where( { id: v.entries.event.id } )

  .then( rows => {

    v.entries.eventTranslations = rows;

    return v;

  } )

  .then( v => {

    [ {
      from: 'title',
      to: 'title'
    }, {
      from: 'description',
      to: 'description'
    }, {
      from: 'free_text',
      to: 'longDescription'
    }, {
      from: 'tags',
      to: 'keywords'
    } ].forEach( field => {

      v.data[ field.to ] = {};

      v.entries.eventTranslations.forEach( t => {

        v.data[ field.to ][ t.lang ] = t[ field.from ];

      } );

    } );

    return v;

  } );

}


function _getEvent( v ) {

  return knex( schemas.event )

  .select( v.fields.event )

  .where( v.identifiers )

  .then( rows => {

    if ( !rows.length ) return v;

    v.entries.event = rows[ 0 ];

    [ 'id', 'uid', 'slug', 'created_at', 'updated_at' ].forEach( field => {

      v.data[ utils.toCamelCase( field ) ] = v.entries.event[ field ];

    } );

    if ( v.entries.event.age_min ) {

      v.data.age.min = v.entries.event.age_min;

    }

    if ( v.entries.event.age_max ) {

      v.data.age.max = v.entries.event.age_max;

    }

    v.data.draft = !v.entries.event.is_published;

    if ( v.entries.event.accessibility ) {

      try {

        let accessibility = JSON.parse( v.entries.event.accessibility );

        accessibility.forEach( a => {

          v.data.accessibility[ a ] = true;

        } );

      } catch( e ) {}

    }

    return v;

  } );

}


function init( svc, c ) {

  knex = knexLib( {
    client: 'mysql',
    connection: c.legacy.mysql
  } );

  schemas = c.legacy.schemas;

  service = svc;

}


function _extractTimezone( entry ) {

  let timezone = 'Europe/Paris';

  try {

    timezone = JSON.parse( entry.store ).timezone;

  } catch( e ) {}

  return timezone;

}