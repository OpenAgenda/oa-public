"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'agenda-locations/middleware' );
const iuMw = require( '@openagenda/image-upload/lib/middleware' );
const OpenCage = require( '@openagenda/geocoder/Opencage' );
const AdresseDataGouvFR = require( '@openagenda/geocoder/AdresseDataGouvFR' );
const utils = require( '@openagenda/utils' );

const states = require( './states' );

const retrieveInsee = require( '../utils/insee' );

let service, config;

module.exports = _.extend( getMiddleware, {
  init: ( s, c ) => { service = s; config = c; },
  get
} );



function getMiddleware( idRef ) {

  if ( arguments.length == 0 ) {

    idRef = 'agenda.id';

  }

  const ocGeocoder = OpenCage( config.opencage || { key: null } );
  const dgGeocoder = AdresseDataGouvFR();

  return {
    loadSettings,
    list: _.assign( list, {
      terms: listTerms
    } ),
    load,
    set,
    setToValidate,
    merge,
    geocode,
    insee,
    reverseGeocode,
    resync,
    remove,
    imageUpload,
    imageRemove,
    newImageUpload,
    newImageRemove,
    getStakeholder,
    getUnverifiedCount
  }

  function load( req, res, next ) {

    const query = _validateAndExtractData( req, res, next, false );

    if ( !query ) return;

    if ( req.query.detailed ) {

      query.detailed = 1;

    }

    _get( query, {
      stakeholderId: req.stakeholderId || null
    }, ( err, location ) => {

      if ( err === 'unknown location' ) {

        return next( {
          code: 404
        } );

      }

      if ( err ) return next( err );

      if ( !location ) return next( 'unknown location' );

      req.location = location;

      next();

    } );

  }


  /**
   * get details from a specific stakeholder based on its id
   */
  function getStakeholder( req, res, next ) {

    service.interfaces.getStakeholder( req.agendaId, req.stakeholderId, ( err, stakeholder ) => {

      if ( err ) return next( err );

      res.json( stakeholder );

    } );

  }


  function loadSettings( namespace, filterInternal ) {

    return ( req, res, next ) => {

      service.getSettings(_.get( req, idRef, null ), { lang: req.lang }, ( err, settings ) => {

        if ( err ) return next( err );

        req[ namespace || 'settings' ] = filterInternal ? _.omit( settings, [ 'translation', 'eventForm', 'labels' ] ): settings;

        next();

      } );

    }

  }



  /**
   * associate image to location
   */

  function imageUpload( req, res, next ) {

    // if a suggestion is loaded ( is stakeholder id )
    const stakeholderId = arguments.length === 4 ? arguments[ 3 ] : false;

    if ( !req.params.locationUid ) {

      return next( 'location uid is missing' );

    }

    service.get( { uid: req.params.locationUid }, ( err, location ) => {

      if ( err ) return next( err );

      if ( !location ) return next( 'location not found' );

      iuMw( {
        dest: config.files.tmpPath,
        handler: ( path, info, cb ) => {

          location.setImage( {
            path,
            stakeholderId
          }, cb );

        }
      } )( req, res, next );

    } );

  }


  /**
   * remove image from location
   */

  function imageRemove( req, res, next ) {

    const stakeholderId = arguments.length === 4 ? arguments[ 3 ] : false;

    if ( !req.params.locationUid ) {

      return next( 'location uid is missing' );

    }

    service.get( { uid: req.params.locationUid }, ( err, location ) => {

      if ( err ) return next( err );

      location.clearImage( { stakeholderId }, err => {

        if ( err ) return next( err );

        res.json( 'ok' );

      } );

    } );

  }


  /**
   * add image to new location.
   *
   * req.userUid is required for naming image
   * according to user, as location does
   * not exist yet
   */

  function newImageUpload( req, res, next ) {

    if ( !req.userUid ) {

      return next( 'user uid is missing' );

    }

    service.getNew( { userUid: req.userUid }, ( err, location ) => {

      if ( err ) return next( err );

      iuMw( {
        dest: config.files.tmpPath,
        handler: ( path, info, cb ) => {

          location.setImage( { path }, cb );

        }
      } )( req, res, next );

    } );

  }


  /**
   * remove image from new location.
   *
   * req.userUid is required for naming image
   * according to user, as location does
   * not exist
   */

  function newImageRemove( req, res, next ) {

    log( 'new image remove' );

    if ( !req.userUid ) {

      return next( 'user uid is missing' );

    }

    service.getNew( { userUid: req.userUid }, ( err, location ) => {

      if ( err ) return next( err );

      location.clearImage( err => {

        if ( err ) return next( err );

        res.json( 'ok' );

      } );

    } );

  }


  function resync( req, res, next ) {

    const agendaId =_.get( req, idRef, null );

    if ( !agendaId ) {

      return next( {
        code: 404,
        message: 'no agenda defined'
      } );

    }

    service.resync( agendaId, () => {} );

    next();

  }

  function getUnverifiedCount( req, res, next ) {

    const agendaId =_.get( req, idRef, null );

    if ( !agendaId ) {

      return next( {
        code: 404,
        message: 'no agenda defined'
      } );

    }

    service.count( {
      agendaId,
      state: states.unverified
    }, ( err, count ) => {

      if ( err ) return next( err );

      res.json( {
        count
      } );

    } );

  }


  /**
   * middleware only allows remove if there are no events linked to
   * the location.
   */
  function remove( req, res, next ) {

    const data = _validateAndExtractData( req, res, next );

    service.get( { uid: data.uid }, ( err, location ) => {

      if ( err ) return next( err );

      if ( !location ) return next( 'location of uid ' + data.uid + ' not found' );

      config.interfaces.getEventCount( location, ( err, agendaEventsCount, allEventsCount ) => {

        if ( err ) return next( err );

        if ( agendaEventsCount ) {

          return res.json( {
            success: false,
            eventCount: agendaEventsCount
          } );

        }

        service[ allEventsCount > 0 ? 'unlink' : 'remove' ]( data, ( err, result ) => {

          if ( err ) return next( err );

          res.json( result );

        } );

      } );

    } );

  }


  /**
   * set of location with forced unvalidated state
   */
  function setToValidate( req, res, next ) {

    // force state to 'to be verified'
    set( req, res, next, { state: states.unverified } );

  }


  function set( req, res, next ) {

    const data = _validateAndExtractData( req, res, next );

    const agendaId =_.get( req, idRef, null );

    const options = {};

    let forcedValues = {};

    if ( arguments.length == 4 ) {

      forcedValues = arguments[ 3 ];

    }

    if ( !data ) {

      return;

    }

    service.set( utils.extend( data, forcedValues ), options, async ( err, result ) => {

      if ( err ) return next( err );

      if ( result.success ) {

        result.location.eventCount = _.get(
          _.head( await config.interfaces.getEventCounts( { id: agendaId }, [ result.location.uid ] ) ),
          'count', 0
        );

      }

      // what does this result look like?
      res.json( result );

    } );

  }


  function merge( req, res, next ) {

    const data = _validateAndExtractData( req, res, next );

    if ( !req.query.uids ) {

      return next( {
        code: 400,
        message: 'location uids are missing'
      } );

    }

    service.merge( data, {
      agendaId: data.agendaId,
      uids: req.query.uids
    }, ( err, result ) => {

      if ( err ) return next( err );

      res.json( result );

    } );

  }


  function listTerms( req, res, next ) {

    const fields = req.query.field.split( ',' );

    const query = {
      agendaId:_.get( req, idRef, null )
    };

    let err = null;

    fields.forEach( f => {

      if ( [ 'name', 'city', 'region', 'department', 'country' ].indexOf( f ) == -1 ) {

        err = 'invalid field';

      }

    } );

    if ( err ) {

      return next( err );

    }

    service.list.terms( fields, query, ( err, terms ) => {

      if ( err ) return next( err );

      res.json( { terms } );

    } );

  }


  function list( req, res, next ) {

    const query = {
      agendaId:_.get( req, idRef, null )
    };

    let limit = config.defaultLimit;

    let offset = 0;

    try {

      limit = Math.min( config.maxLimit, parseInt( req.query.limit || config.defaultLimit ) );

      offset = parseInt( req.query.offset || 0 );

    } catch ( err ) {

      log( 'error', 'could extract limit & offset from query: %s', err );

    }

    [ 'search', 'box', 'uids', 'state' ].forEach( ( field ) => {

      if ( req.query[ field ] ) query[ field ] = req.query[ field ];

    } );

    service.list( query, offset, limit, async ( err, locations, total ) => {

      if ( err ) return next( err );

      const counts = [];

      const agendaId =_.get( req, idRef, null );

      const locationUids = locations.map( l => l.uid );

      try {

        counts.splice( 0, 0, ... await config.interfaces.getEventCounts( { id: agendaId }, locationUids ) );

      } catch ( e ) {

        log( 'error', 'interface error: getEventCounts on agenda id %s and locations %s', agendaId, locationUids, e );

      }

      const locationsWithEventCounts = locations.map( l => _.extend( l, { eventCount: _.get( _.first( counts.filter( c => c.uid === l.uid ) ), 'count' ) } ) );

      log( 'retrieved %s items for offset %s, %s successfully. Total is %s', locations.length, offset, limit, total );

      req.locations = {
        total,
        offset,
        limit,
        items: req.filterInternal ? locationsWithEventCounts.map( _.partialRight( _.omit, [ 'agendaId', 'suggestions' ] ) ) : locationsWithEventCounts
      }

      next();

    } );

  }


  function reverseGeocode( req, res, next ) {

    log( 'retrieving reverse geocodes for %s,%s', req.query.latitude, req.query.longitude );

    service.geocode.reverse( {
      latitude: req.query.latitude,
      longitude: req.query.longitude
    }, _handleGeocodeResponse.bind( null, req, res ) );

  }


  function geocode( req, res, next ) {

    log( 'retrieving geocodes', _.pick( req.query, [ 'address', 'countryCode' ] ) );

    service.utils.geocode( {
      address: req.query.address,
      countryCode: req.query.countryCode
    }, _handleGeocodeResponse.bind( null, req, res ) );

  }


  function insee( req, res, next ) {

    const data = _.pick( req.query, [ 'city', 'department', 'latitude', 'longitude' ] );

    log( 'retrieving insee codes for %j', data );

    if ( !data.latitude || !data.longitude ) {

      return res.send( 400 );

    }

    retrieveInsee( data ).then( code => {

      return res.json( { code } );

    }, err => {

      log( 'error', 'geocode farm error: could not retrieve insee code for %j: %j', data, e );

      return res.send( 500 );

    } );

  }


  async function _handleGeocodeResponse( req, res, err, results ) {

    log( 'info', 'received geocodefarm response', results, _.pick( req.query, [ 'address', 'countryCode' ] ) );

    if ( err ) {

      log( 'error', 'geocode farm error: ' + err );

      res.statusCode = 502;

      return res.send( 'nok' );

    };

    if ( !results.length ) {

      log( 'info', 'geocode farm did not find any result', _.pick( req.query, [ 'address', 'countryCode' ] ) );

      _dataGouvGeocode( req, res );

    }

    res.json( { results } );

  }


  function _openCageGeocode( req, res ) {

    ocGeocoder( _.get( req, 'query.address' ), {
      countryCode: _.get( req, 'query.countryCode' ),
      language: req.lang
    } ).then( results => {

      res.send( { results } );

    }, err => {

      log( 'error', 'OpenCage error: ' + err );

      res.statusCodde = 502;

      res.send( 'nok' );

    } );

  }

  function _dataGouvGeocode( req, res ) {

    log( 'info', 'querying datagouv', _.pick( req.query, [ 'address', 'countryCode' ] ) );

    dgGeocoder.detailed( _.get( req, 'query.address' ) ).then( result => {

      log( 'info', 'received datagouv response', result, _.pick( req.query, [ 'address', 'countryCode' ] ) );

      res.send( { results: result ? [ result ] : [] } );

    }, err => {

      log( 'error', 'DataGouvGeocode error: ' + err );

      res.statusCodde = 502;

      res.send( 'nok' );

    } );

  }


  function _validateAndExtractData( req, res, next, agendaRequired = true ) {

    const data = req.body || {};

    if ( !data ) {

      next( 'data is missing' );

      return false;

    }

    const agendaId = _.get( req, idRef, null );

    if ( agendaRequired && !agendaId ) {

      next( 'missing agenda reference' );

      return false;

    }

    if ( agendaId ) data.agendaId = agendaId;

    if ( req.userUid ) {

      data.userUid = req.userUid;

    }

    // suggestions are not handled through
    // standard set.
    if ( data.suggestions ) {

      delete data.suggestions;

    }

    if ( req.params.locationUid ) {

      data.uid = req.params.locationUid;

    }

    return data;

  }

}


function get( req, res, next ) {

  _get( { uid: req.params.locationUid || req.params.uid, detailed: req.query ? req.query.detailed : false }, ( err, location ) => {

    if ( err ) return next( err );

    if ( !location ) return next( 'unknown location' );

    req.location = location;

    next();

  } )

}


function _get( query, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  const params = utils.extend( {
    fromDb: true,
    instanciate: false,
    fullImagePath: true,
    decorate: true,
    stakeholderId: null
  }, options );

  service.get( query, params, ( err, location ) => {

    if ( err ) return cb( err );

    if ( !location ) return cb( 'unknown location' );

    config.interfaces.getEventCount( location, ( err, agendaEventsCount, allEventsCount ) => {

      if ( err ) return cb( err );

      location.eventCount = agendaEventsCount;

      cb( null, _cleanLocation( location ) );

    } );

  } );

}


function _cleanLocation( location ) {

  [ 'store', 'eveId', 'agendaId', 'id' ]

  .filter( f => location[ f ] !== undefined )

  .forEach( f => {

    delete location[ f ];

  } );

  return location;

}
