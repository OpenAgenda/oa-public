"use strict";

const w = require( 'when' );

const wn = require( 'when/node' );

const knexLib = require( 'knex' );

const utils = require( 'utils' );

const eventUtils = require( '../utils' );

const _ = require( 'lodash' );

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

  w( {
    identifiers,
    event: null,
    force: options.force || false,
    legacy: {
      valid: null,
      event: null,
      entries: null
    },
    transfered: false,
    getOptions: options
  } )

  .then( _getServiceEvent )

  .then( _loadLegacy )

  .done( v => {

    if ( !v.legacy.event ) {

      return cb( null, {
        success: false,
        transfered: false,
        legacy: v.legacy,
        event: v.event
      } );

    }

    // event already exists, if has been updated later than legacy, transfer is not made
    if ( !v.force && v.event && v.event.updatedAt >= v.legacy.event.updatedAt ) {

      return cb( null, {
        success: true,
        transfered: false,
        created: false,
        legacy: v.legacy,
        event: v.event
      } );      

    }

    let set = v.event ? service.update.bind( null, v.identifiers ) : service.create;

    set( v.legacy.event, { draft: v.legacy.event.draft }, ( err, r ) => {

      if ( err ) return cb( err );

      cb( null, _.extend( {
        success: r.success,
        transfered: r.success,
        legacy: v.legacy,
        created: !v.event
      }, r ) );

    } );

  }, cb );

}


function get( identifiers, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  w( _.extend( {
    identifiers
  }, options, {
    fields: {
      event: [ 
        'id', 'uid', 'slug', 
        'created_at', 'updated_at', 
        'age_min', 'age_max', 'image', 
        'accessibility', 'is_published',
        'store', 'owner_id', 'origin_uid'
      ],
      eventTranslations: [ 'title', 'description', 'free_text', 'tags', 'lang' ],
      eventLocation: [ 'id', 'location_id', 'ticket_link' ],
      eventLocationTranslations: [ 'pricing_info', 'lang' ],
      location: [ 'id', 'uid', 'store' ],
      user: [ 'uid' ],
      agendaEvents: [ 'review_id' ],
      agendas: [ 'uid', 'private' ],
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
    data: _.extend( {}, validate.default ),
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

  .then( _defineDraft )

  .then( _revalidate )

  .done( v => {

    cb( null, v.clean ? v.clean : v.data, {
      entries: v.entries,
      valid: !!v.clean,
      errors: v.errors
    } );

  }, cb );

}


function _defineDraft( v ) {

  v.data.draft = true;

  if ( v.entries.event.is_published && eventUtils.isComplete( v.data ) ) {

    v.data.draft = false;

  }

  return v;

}


/**
 * filter out invalid data in non-essential fields
 */
function _revalidate( v ) {

  let redo = false;

  v.errors = [];

  try {

    v.clean = ( v.data.draft ? validate.draft : validate )( v.data );

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

    v.data.ownerUid = v.entries.user ? v.entries.user.uid : null;

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


function _getServiceEvent( v ) {

  return wn.call( service.get, v.identifiers, { private: null } )

  .then( event => {

    v.event = event;

    return v;

  } );

}


function _loadLegacy( v ) {

  return wn.call( get, v.identifiers, v.getOptions )

  .then( r => {

    v.legacy = _.assign( r[ 1 ], { event: r[ 0 ] } );

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

  .orderBy( 'created_at', 'asc' )

  .then( rows => {

    v.entries.agendas = rows;

    return v;

  } )

  .then( v => {

    if ( !v.entries.agendas.length ) return v;

    v.data.private = v.entries.agendas[ 0 ].private;

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

  .where( { id: v.entries.eventLocation ? v.entries.eventLocation.id : -1 } )

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

    if ( v.entries.eventLocation ) {

      v.data.registration = ( v.entries.eventLocation.ticket_link || '' ).split( ',' ).map( v => v.trim() ).filter( v => v.length );

    }

    return v;

  } );

}


function _getEventTranslations( v ) {

  return knex( schemas.eventTranslation )

  .select( v.fields.eventTranslations )

  .where( { id: v.entries.event.id } )

  .whereNotNull( 'title' ) // ignore null title rows

  .then( rows => {

    v.entries.eventTranslations = rows.filter( r => r.title.length );

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

        v.data[ field.to ][ t.lang ] = field.to === 'keywords' ? _parseKeywords( t[ field.from ] ) : t[ field.from ];

      } );

    } );

    return v;

  } );

}


function _parseKeywords( keywords ) {

  if ( !keywords || !keywords.length ) return [];

  return keywords.split( ',' ).map( k => k.trim() );

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


    [ 
      'id', 'uid', 'slug', 'created_at', 'updated_at',
      [ 'origin_uid', 'agendaUid' ],
      [ 'age_min', 'age.min' ],
      [ 'age_max', 'age.max' ]
    ].forEach( f => {

      let fromField = _.isArray( f ) ? f[ 0 ] : f,

        toField = _.isArray( f ) ? f[ 1 ] : f;

      _.set( v.data, toField, _.get( v.entries.event, fromField, null ) );

    } );

    if ( v.entries.event.image ) {

      v.data.image = {
        filename: v.entries.event.image,
        variants: [ {
          type: 'full',
          filename: 'evf' + v.entries.event.image
        }, {
          type: 'thumbnail',
          filename: 'evtb' + v.entries.event.image
        } ]
      }

    }

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

  knex = c.legacyKnex;

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