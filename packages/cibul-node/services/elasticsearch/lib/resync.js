"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const fs = require( 'fs' );
const VError = require( 'verror' );

const { promisify } = require( 'util' );

const log = require( '@openagenda/logs' )( 'services/elasticsearch/resync' );
const loopThroughTable = require( '@openagenda/legacy/rebuildSearchIndex/loopThroughTable' );

const model = require( '../../model' );

const { knex, aws: { imageBucketPath: imageBasePath } } = require( '../../../config' );

const _removeReviewZombies = ES => promisify(
  _removeZombies( ES, 'reviews' )
);
const _removeEventZombies = ( ES, agendaId ) => promisify(
  _removeZombies( ES, 'events', agendaId ? { reviewId: agendaId } : {} )
)();

const knownBuildErrors = [
  'no event record',
  'no review_article record',
  'no location record',
  'invalid timings',
  'invalid location store',
  'invalid reviewer store',
  'invalid title',
  'invalid description',
  'invalid freeText',
  'invalid article store'
];

module.exports = async function( ES, options, cb ) {

  if ( arguments.length == 1 ) {
    cb = options;
    options = {};
  }

  const params = _.assign( {
    agendaId: false,
    isPublished: null,
    interval: 0,
    reset: false,
    showAll: true,
    since: null,
    removeZombies: true,
    logEveryUpdate: false
  }, options );

  if ( params.reset ) {
    delete params.agendaId;
    await ES.resetIndex();
  }

  const agendaId = params.agendaId || params.reviewId;

  if ( !agendaId ) {
    if ( params.removeZombies ) {
      await _removeReviewZombies( ES );
    }
    await _updateReviews( ES, _.pick( params, [ 'since', 'logEveryUpdate' ] ) );
  }

  if ( params.removeZombies ) {
    await _removeEventZombies( ES, agendaId );
  }

  await _updateEvents( ES, agendaId, _.pick( params, [ 'since', 'logEveryUpdate' ] ) );

  await ES.refreshIndex();

  cb();

}


async function _updateReviews( ES, { since, logEveryUpdate } ) {

  const count = { processed: 0, errors: 0 };

  await loopThroughTable( knex, 'review', async id => {

    await ES.updateReview( id );
    if ( logEveryUpdate ) log( 'updated agenda of id %s', id );

    count.processed++;

    if ( !( count.processed % 100 ) ) {
      log( 'info', 'updated %s reviews', count.processed );
    }

  }, { since } );

}

async function _updateEvents( ES, agendaId, { since, logEveryUpdate } ) {

  const count = { processed: 0, errors: 0 };

  await loopThroughTable( knex, agendaId ? 'review_article' : 'event', async id => {

    try {
      await ES.updateEvent( id );
      if ( logEveryUpdate ) log( 'updated event of id %s', id );
    } catch( e ) {
      if ( knownBuildErrors.includes( e.message ) ) {
        log( 'warn', e.message, { eventId: id } );
      } else if ( e.statusCode ) {
        log( 'warn', 'failed to index event of id %s', id, e );
        console.log( JSON.stringify( e.items, null, 2 ) );
      } else {
        log( 'error', e );
        throw new VError( 'failed to build event of id %s', id );
      }
    }

    count.processed++;

    if ( !( count.processed % 100 ) ) {
      log( 'info', 'updated %s events', count.processed );
    }

  }, {
    query: agendaId ? { review_id: agendaId } : null,
    field: agendaId ? 'event_id' : 'id',
    since
  } );

}


function _defineGetQuery( type, params, obj ) {

  const q = { id: obj[ type=='reviews' ? 'reviewId' : 'eventId' ] };

  if ( type == 'events' && params.reviewId ) {
    q.reviewId = params.reviewId;
  }

  return q;

}

function _removeZombies( ES, type, params ) {

  if ( !params ) params = {};

  return cb => {

    const count = { processed: 0, removed: 0, errors: 0 };

    log( 'info', 'removing %s zombies', type );

    _loopThroughIndex( type === 'reviews' ? ES.searchReviews : ES.searchEvents, params, ( obj, next ) => {

      model[ type ]().get( _defineGetQuery( type, params, obj ), function( err, dbRef ) {

        if ( count.processed % 1000 === 0 ) _logZombies( type, count );

        count.processed++;

        if ( err ) {

          count.errors++;

          log( 'error', 'could not remove agenda from index: %s', err );

          return _delay( params.interval, next )();

        }

        if ( dbRef ) return _delay( params.interval, next )();

        const id = obj[ type=='reviews' ? 'reviewId' : 'eventId' ];

        log( 'info', 'removing %s zombie id %s', type, id );

        count.removed++;

        ( type === 'reviews' ? ES.updateReview : ES.updateEvent )( id, { removeUnreferenced: true, removeInvalid: true } ).then( next );

      } );

    }, err => {

      if ( err ) return cb( err );

      _logZombies( type, count );

      cb();

    } );

  }

}

function _delay( sleep, next ) {

  if ( sleep === undefined ) {

    sleep = 0;

  }

  return function( err ) {

    setTimeout( function() {

      next( err );

    }, sleep );

  }

}


function _logZombies( type, count ) {

  log( 'info', 'zombies - %s: processed %s, removed %s, errors %s', type, count.processed, count.removed, count.errors );

}

function _logUpdates( type, count ) {

  log( 'info', 'updates - %s: processed %s, errors %s', type, count.processed, count.errors );

}


function _loopThroughIndex( search, params, usageFunc, cb ) {

  let hasMore = true, offset = 0;

  const limit = 10;

  async.whilst( () => hasMore, function( wcb ) {

    log( 'info', 'fetching in index offset %s', offset );

    search( _.extend( { options: { from: offset, size: limit } }, params ) ).then( result => {

      hasMore = !!result.data.length;

      async.eachSeries( result.data, usageFunc, err => {

        if ( err ) return wcb( err );

        offset += limit;

        wcb();

      } );

    }, wcb );

  }, cb );

}


function _loopThroughDb( schema, params, usageFunc, cb ) {

  const limit = 5;

  let hasMore = true, offset = 0;

  async.whilst( function()  {

    return hasMore;

  }, function( wcb ) {

    log( 'info', 'fetching in db %s offset %s', schema, offset );

    model[ schema ]().list( _.extend( {
      extended: true,
      offset,
      limit
    }, params ), function( err, result ) {

      log( 'retrieved from db %s offset %s', schema, offset );

      if ( err ) return wcb( err );

      hasMore = !!result.length;

      async.eachSeries( result, usageFunc, function( err ) {

        if ( err ) return wcb( err );

        offset += limit;

        wcb();

      } );

    } );

  }, cb );

}
