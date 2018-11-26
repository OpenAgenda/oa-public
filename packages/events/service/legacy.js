"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const moment = require( 'moment-timezone' );
const { promisify } = require( 'util' );
const VError = require( 'verror' );
const w = require( 'when' );
const wn = require( 'when/node' );

const sUtils = require( '@openagenda/service-utils' );

const eventUtils = require( '../utils' );
const getEvent = require( './get' );
const validate = require( './validate' );

const log = require( '@openagenda/logs' )( 'legacy' );

let knex, schemas, service;

module.exports = {
  init,
  get,
  transfer,
  update,
  remove
};


async function remove( identifiers ) {

  const legacyEvent = _.first( await wn.call( get, identifiers, { internal: true, private: null } ) );

  if ( !legacyEvent ) {

    throw new VError( 'event of identifiers %j was not found and could not be removed from legacy', identifiers );

  }

  const deletedEntries = await knex( schemas.event ).delete().where( 'id', legacyEvent.id );

  const deletedRecord = await knex( schemas.deleted ).insert( {
    deleted_id: legacyEvent.id,
    uid: legacyEvent.uid,
    type: 'Event',
    deleted_at: new Date,
    store: JSON.stringify( legacyEvent )
  } );

  return {
    success: deletedEntries===1,
    deleted: deletedEntries,
    insertedInDeletedLog: deletedRecord.length === 1
  }

}

async function update( identifiers, options ) {

  const event = await getEvent( identifiers, _.extend( {}, options, { internal: true } ) );

  if ( !event ) {

    throw new VError( 'event not found' );

  }

  log( 'fetched references required for legacy syncing',
    _.pick( event, [ 'ownerUid', 'agendaUid', 'locationUid', 'references', 'uid' ] )
  );

  const userId = _.get( await knex( schemas.user ).first( 'id' ).where( 'uid', event.ownerUid ), 'id' );

  const agendaId = _.get( await knex( schemas.agenda ).first( 'id' ).where( 'uid', event.agendaUid ), 'id' );

  const locationId = _.get( await knex( schemas.location ).first( 'id' ).where( 'uid', event.locationUid ), 'id' );

  const legacyEventRecords = await knex( schemas.event ).select( 'id', 'uid' ).whereIn( 'uid', ( event.references || [] ).concat( event.uid ) );

  const legacyEventId = _.get( legacyEventRecords.filter( r => r.uid  === event.uid ), '0.id' );

  const legacyEventReferenceIds = legacyEventRecords.map( r => r.id ).filter( id => id !== legacyEventId );

  log( 'syncing legacy event', {
    identifiers, userId, agendaId, locationId, legacyEventId, legacyEventReferenceIds
  } );

  const entries = {
    event: _.extend(
      // always applies
      { is_published: true, is_new: false },
      // fields that directly translate to old schema
      _.pick( _.mapKeys( event, ( v, k ) => _.snakeCase( k ) ), [ 'uid', 'slug', 'created_at', 'updated_at', 'file_key' ] ),
      // fields that don't.
      {
        image: event.image.filename,
        image_credits: event.image.credits,
        age_min: event.age.min,
        age_max: event.age.max,
        origin_uid: event.agendaUid,
        owner_id: userId,
        accessibility: _updateLegacyAccessibility( event.accessibility ),
        store: JSON.stringify( { 
          images: event.image,
          links: _.get( event, 'links', [] )
            .map( ( { link, data } ) => ( { 
              link, 
              code: _.get( data, 'html' ) 
            } ) )
        } )
      }
    ),
    eventTranslations: _.uniq( _.keys( event.title ).concat( _.keys( event.description ) ).concat( _.keys( event.longDescription ) ) ).map( lang => ( {
      id: 'TBD',
      lang,
      title: _.get( event.title, lang ),
      description: _.get( event.description, lang ),
      free_text: _.get( event.longDescription, lang ),
      tags: _.get( event.keywords, lang, [] ).join( ', ' )
    } ) ),
    eventLocation: {
      event_id: 'TBD',
      location_id: locationId,
      ticket_link: event.registration.join( ', ' ),
      created_at: event.createdAt,
      updated_at: event.updatedAt
    },
    eventLocationTranslations: _.keys( event.conditions ).map( lang => ( {
      lang,
      pricing_info: event.conditions[ lang ]
    } ) ),
    occurrences: event.timings.map( t => {

      return {
        event_id: 'TBD',
        location_id: locationId,
        date: moment.tz( t.begin, event.timezone ).format( 'YYYY-MM-DD' ),
        time_start: moment.tz( t.begin, event.timezone ).format( 'HH:mm' ),
        time_end: moment.tz( t.end, event.timezone ).format( 'HH:mm' ),
        created_at: event.createdAt,
        updated_at: event.updatedAt
      }
    } ),
    eventReferences: agendaId ? legacyEventReferenceIds.map( id => ( {
      event_id: 'TBD',
      agenda_id: agendaId,
      ref_event_id: id
    } ) ) : []
  }

  if ( legacyEventId ) {

    log( 'legacy event found, updating', legacyEventId );

    return _updateLegacy( legacyEventId, entries );

  } else {

    log( 'legacy event not found, creating' );

    return _createLegacy( entries );

  }

}


function transfer( identifiers, options, cb ) {

  log( 'transferring event of identifiers %s', JSON.stringify( _.pick( identifiers, [ 'id', 'uid', 'slug' ] ) ) );

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  w( {
    identifiers,
    event: null,
    force: options.force || false,
    context: options && options.context ? options.context : null,
    legacy: {
      valid: null,
      event: null,
      entries: null
    },
    transferred: false,
    getOptions: options
  } )

  .then( _loadLegacy )

  .then( _getServiceEvent )

  .done( v => {

    if ( !v.legacy.event ) {

      log( 'error', 'failed to load legacy event for transfer' );

      return cb( null, {
        success: false,
        transferred: false,
        legacy: v.legacy,
        event: v.event
      } );

    }

    // event already exists, if has been updated later than legacy, transfer is not made
    if ( !v.force && v.event && v.event.updatedAt > v.legacy.event.updatedAt ) {

      log( 'warn', 'event is timestamped as more recent than legacy, aborting transfer' );

      return cb( null, {
        success: true,
        transferred: false,
        created: false,
        legacy: v.legacy,
        event: v.event
      } );      

    }

    let set = service.create;

    // event already exists, an update is in order
    if ( v.event ) {

      log( 'info', 'updating event %s ( %s ) from legacy', v.legacy.event.uid, v.legacy.event.slug );

      set = service.update.bind( null, { uid: v.legacy.event.uid } );

      // creatorUid never changes
      v.legacy.event.creatorUid = v.event.creatorUid;

    } else {

      log( 'info', 'creating event %s ( %s ) from legacy', v.legacy.event.uid, v.legacy.event.slug );

    }

    set( v.legacy.event, {
      draft: v.legacy.event.draft, 
      protected: false, 
      context: v.context,
      evaluateLegacyIdentifiers: false,
      legacy: true
    }, ( err, r ) => {

      if ( err ) return cb( err );

      cb( null, _.extend( {
        success: r.success,
        transferred: r.success,
        legacy: v.legacy,
        created: !v.event,
        complete: v.legacy.complete,
        errors: r.errors
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
        'store', 'owner_id', 'origin_uid',
        'file_key', 'image_credits'
      ],
      eventTranslations: [ 'title', 'description', 'free_text', 'tags', 'lang' ],
      eventLocation: [ 'id', 'location_id', 'ticket_link' ],
      eventLocationTranslations: [ 'pricing_info', 'lang' ],
      location: [ 'id', 'uid', 'store' ],
      user: [ 'uid' ],
      agendaEvents: [ 'review_id' ],
      eventReferences: [ 'ref_event_id' ],
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

  .then( _getAgendaEventReferences )

  .then( _getAgendas )

  .then( _getLocation )

  .then( _getOccurrences )

  .then( _getOwner )

  .then( _defineDraft )

  .then( _revalidate )

  .done( v => {

    if ( !v.entries.event ) {

      return cb( null, null );

    }

    cb( null, v.clean ? v.clean : v.data, {
      entries: v.entries,
      valid: !!v.clean,
      errors: v.errors,
      complete: v.complete
    } );

  }, cb );

}


function _defineDraft( v ) {

  v.data.draft = true;

  const { complete, errors } = eventUtils.isComplete( v.data, true );

  if ( complete ) {

    v.data.draft = false;

  }

  v.complete = {
    isComplete: complete,
    errors
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

  if ( !v.entries.event ) return v;

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

    v.data.creatorUid = v.entries.user ? v.entries.user.uid : null;

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

        return 1;

      } else {

        return -1;

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

  if ( !v.legacy.event ) return v;

  return wn.call( service.get, { uid: v.legacy.event.uid }, { private: null, internal: true } )

  .then( event => {

    v.event = event;

    return v;

  } );

}


function _loadLegacy( v ) {

  return wn.call( get, v.identifiers, v.getOptions )

  .then( r => {

    v.legacy = _.assign( r[ 1 ], { event: r[ 0 ] } );

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

  if ( !v.entries.event ) return v;

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


function _getAgendaEventReferences( v ) {

  if ( !v.entries.event ) return v;

  return knex( schemas.eventReferences )
    .select( v.fields.eventReferences )
    .where( 'event_id', v.entries.event.id )
    .then( rows => {
      
      // get uid
      return knex( schemas.event )
        .select( 'uid' )
        .whereIn( 'id', rows.map( r => r.ref_event_id ) );

    } ).then( rows => {

      v.data.references = rows.map( r => r.uid );

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

      if ( !r.pricing_info || !r.pricing_info.length ) return;

      v.data.conditions[ r.lang ] = r.pricing_info;

    } );

    return v;  

  } );

}


function _getEventLocation( v ) {

  if ( !v.entries.event ) return v;

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

  if ( !v.entries.event ) return v;

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

  if ( !keywords || !keywords.length ) return [];

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

      v.data[ _.camelCase( field ) ] = v.entries.event[ field ];

    } );


    [
      'id', 'uid', 'slug', 'created_at', 'updated_at',
      [ 'file_key', 'fileKey' ],
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
        credits: v.entries.event.image_credits,
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

    try {

      v.data.links = JSON.parse( _.get( v, 'entries.event.store', '{}' ) )
        .links
        .filter( link => link.code )
        .map( ( { link, code } ) => ( { type: 'oembed', link, data: { html: code, url: link } } ) );

    } catch ( e ) {

      log( 'error', 'could not parse links from legacy store', e );

    }

    return v;

  } );

}


async function _updateLegacy( eventId, entries ) {

  const inserted = {
    eventTranslations: []
  };

  const updated = {
    eventTranslations: []
  };

  const removed = {};

  await knex( schemas.event ).update( entries.event ).where( 'id', eventId );

  log( 'updated event %s', eventId );

  const languages = entries.eventTranslations.map( t => t.lang );

  let eventLocation = await _assembleEventLocation( eventId, entries.eventLocation );

  log( 'updated eventLocation for %s', eventId );

  // delete languages that are not anymore set

  removed.eventTranslations = await knex( schemas.eventTranslation )
    .delete()
    .where( 'id', eventId )
    .whereNotIn( 'lang', languages );
  
  log( 'removed previous event translation entries for %s', eventId );

  for ( const entry of entries.eventTranslations ) {

    const insert = _.extend( entry, { id: eventId } );

    if ( await knex( schemas.eventTranslation ).first( 'id' ).where( { id: eventId, lang: entry.lang } ) ) {

      await knex( schemas.eventTranslation ).update( entry ).where( {
        id: eventId,
        lang: entry.lang
      } );

      updated.eventTranslations.push( insert );

    } else {

      await knex( schemas.eventTranslation ).insert( insert );

      inserted.eventTranslations.push( insert );

    }

  }

  log( 'inserted new event translation entries for %s', eventId );

  // delete all occurrences
  removed.occurrences = await knex( schemas.occurrence ).delete().where( 'event_id', eventId );

  log( 'removed previous occurrences for event %s', eventId );

  inserted.occurrences = await _insertOccurrences( eventId, entries.occurrences );

  log( 'inserted occurrence replacements for event %s', eventId );


  // event location is updated
  if ( eventLocation.id ) {

    await knex( schemas.eventLocationTranslation )
      .delete()
      .where( 'id', eventLocation.id );

    await knex( schemas.eventLocation ).update( entries.eventLocation ).where( 'id', eventLocation.id );

    eventLocation = _.extend( { id: eventLocation.id }, entries.eventLocation );

    log( 'updated eventLocation for event %s', eventId );

  } else {

    eventLocation = await _insertEventLocation( eventId, entries.eventLocation );

    log( 'inserted eventLocation ref for event %s', eventId );

  }

  await _insertEventLocationTranslations( eventLocation.id, entries.eventLocationTranslations );

  log( 'inserted eventLocation translation entries for event %s', eventId );

  await _updateAgendaEventReferences( eventId, entries.eventReferences );

  log( 'updated agenda event references for event %s', eventId );

  return {
    inserted,
    updated,
    removed,
    success: true
  }

}


async function _insertEventLocation( eventId, data ) {

  const inserted = _.extend( data, { event_id: eventId } );

  const [ eventLocationInsertId ] = await knex( schemas.eventLocation ).insert( inserted );

  return _.extend( { id: eventLocationInsertId }, inserted );

}

async function _assembleEventLocation( eventId, data ) {

  const result = await knex( schemas.eventLocation ).first( 'id' ).where( 'event_id', eventId );

  return _.extend( data, result ? { id: result.id } : {}, { event_id: eventId } );

}

async function _insertOccurrences( eventId, entries ) {

  const inserted = []

  for ( const entry of entries ) {

    const insert = _.extend( entry, { event_id: eventId } );

    await knex( schemas.occurrence ).insert( insert );

    inserted.push( insert );

  }

  return inserted;

}


async function _createLegacy( entries ) {

  const [ insertedId ] = await knex( schemas.event ).insert( entries.event );

  const inserted = {
    event: _.extend( entries.event, { id: insertedId } ),
    eventTranslations: [],
    eventLocationTranslations: [],
    eventLocation: null,
    occurrences: []
  }

  
  
  for ( const entry of entries.eventTranslations ) {

    const insert = _.extend( entry, { id: insertedId } );

    await knex( schemas.eventTranslation ).insert( insert );

    inserted.eventTranslations.push( insert );

  }

  inserted.occurrences = await _insertOccurrences( insertedId, entries.occurrences );

  inserted.eventLocation = await _insertEventLocation( insertedId, entries.eventLocation );

  inserted.eventLocationTranslations = await _insertEventLocationTranslations( inserted.eventLocation.id, entries.eventLocationTranslations );

  inserted.eventReferences = await _updateAgendaEventReferences( insertedId, entries.eventReferences );

  return {
    success: true,
    inserted
  }

}


async function _updateAgendaEventReferences( eventId, entries ) {

  // delete previous
  await knex( schemas.eventReferences ).delete().where( 'event_id', eventId );

  const inserted = entries.map( e => _.set( e, 'event_id', eventId ) );

  // insert new
  const result = await knex( schemas.eventReferences ).insert( inserted );

  return inserted;

}


async function _insertEventLocationTranslations( eventLocationId, entries ) {

  const inserted = [];

  for ( const entry of entries ) {

    const insert = _.extend( entry, { id: eventLocationId } );

    await knex( schemas.eventLocationTranslation ).insert( insert );

    inserted.push( insert );

  }

  return inserted;

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


function _updateLegacyAccessibility( accessibility = null ) {

 if ( !accessibility ) return null;

 return JSON.stringify( _.keys( accessibility ).filter( code => accessibility[ code ] ) );

}
