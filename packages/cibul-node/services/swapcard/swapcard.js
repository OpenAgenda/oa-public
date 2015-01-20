"use strict";

var log = require( '../../lib/logger' )( 'swapcard_service' ),

https = require( 'https' ),

URL = require( 'url' ),

coms = require( '../../lib/coms' ),

async = require( 'async' ),

moment = require( 'moment' ),

OAuth2 = require( 'oauth' ).OAuth2,

notification,

w = require( 'when' ),

wn = require( 'when/node' ),

querystring = require( 'querystring' ),

lib = require( '../../lib/lib' );

module.exports = function ( m, c ) {

  return functions( m, c );

};

var functions = function( model, config ) {

  var oauth2 = new OAuth2( config.bridges.swapcard.clientID, 
        config.bridges.swapcard.clientSecret,
        config.bridges.swapcard.baseSite,
        config.bridges.swapcard.authorizePath,
        config.bridges.swapcard.accessTokenPath,
        null
    ),

  notification = require( '../notification/notification' )( model, config );

  moment.lang( 'fr' );

  /**
   * link an account or an agenda to an other application's account
   */
  
  var connectService = function( req, res ) {

    var stateObj = {
      slug: req.agenda.slug,
      dsjid986: 58
    },

    stateObj = JSON.stringify( stateObj ),

    uncodedState = new Buffer( stateObj ).toString( 'base64' );

    var params = {
      redirect_uri: config.bridges.swapcard.redirect,
      scope: 'scope_event_rw',
      response_type: 'code',
      state: uncodedState
    };

  	var url = oauth2.getAuthorizeUrl( params );

    res.redirect( url );

  },

  getAccessToken = function( slug, code, type, cb ) {

    log( 'info', 'getting access token of grant_type %s', type );

    var stateObj = JSON.stringify( {
      slug: slug,
      djncdkc: 32
    } ),

    params = {
      grant_type: type === 'authorization_code' ? 'authorization_code' : 'refresh_token',
      redirect_uri: config.bridges.swapcard.redirect,
      state: new Buffer( stateObj ).toString( 'base64' )
    };

    oauth2.getOAuthAccessToken( code, params, function( err, access, refresh, result ) {

      if ( err ) return cb( err );

      log( 'info', 'oauth response successful' );

      cb( null, access, refresh );

    } );

  },

  processEvents = function( agenda, action, cb ) {

    var total = 40,

    offset = 0;

    async.whilst( 
      function( ) { return total == 40 },

      function( callback ) {

        model.events().list( { reviewId: agenda.id, offset: offset }, function( err, events ) {

          if ( err ) return callback( err );

          total = events.length;

          offset = offset + events.length;

          async.eachSeries( events, _loadValues( agenda, action ), function( err ) {

            if ( err ) return callback( err );

            callback();

          } );

        });
                
      },

      function( err ) {

        if ( err ) return cb( err );

        return cb();

      }

     );

  },

  addJob = function( eventId, agendaId, action ) {

    coms.queue( 'jobs', { type: 'swapcard', action: action, eventId: eventId, agendaId: agendaId } );

  },

  unlinkEvents = function( agenda, cb ) {

    log( 'unlinking events' );

    var total = 40,

    offset = 0;

    async.whilst( 
      function( ) { return total == 40 },

      function( callback ) {

        model.events().list( { reviewId: agenda.id, offset: offset }, function( err, events ) {

          if ( err ) return callback( err );

          total = events.length;

          offset = offset + events.length;

          async.eachSeries( events, function( e, ecb ) {

            e = model.events().instance( e );

            e.removeStore( 'swapcard', true, function( err ) {

              if ( err ) return ecb( err );

              return ecb();

            } );

          }, function( err ) {

            if ( err ) return callback( err );

            callback();

          } );

        });
                
      },

      function( err ) {

        log( 'error', typeof err == 'string' ? err : JSON.stringify( err ) );

        if ( err ) return cb( err );

        return cb();

      }

     );

  },

  create = function( values, cb ) {

    log( 'info', 'creating event with values : %s', JSON.stringify( values ) );

    var instance,

    agenda,

    store,

    bearer,

    data;

    wn.call( model.reviews().get, { id: values.agendaId } )

    .then( function( review ) {

      log( 'info', 'loaded agenda %s', JSON.stringify( review.id ) );

      agenda = model.reviews().instance( review );

      log( 'info', 'loaded agenda instance, loading event with id %s', values.eventId );

      return wn.call( model.events().get, { id: values.eventId } );

    } )

    .then( function( e ) {

      if ( !e ) throw 'event was not found';

      log( 'info', 'loaded event %s', e.id );

      instance = model.events().instance( e );

      return wn.call( _getEventData, instance );

    } )

    .then( function( eventSwapcard ) {

      log( 'info', 'successfully parsed event' );

      store = agenda.getStore( 'swapcard', null );

      data = JSON.stringify( eventSwapcard );

      return wn.call( _request, 'POST', config.bridges.swapcard.baseSite + '/v1/events', { 'Authorization': 'Bearer ' + store.access, 'Content-Type': 'application/json', 'Accept-Language': 'fr,eng' }, data, null );

    } )

    .then( function( result ) {

      if ( result.statusCode == 201 ) {

        log( 'Create event swapcard success' );

        return wn.call( instance.setStore, 'swapcard', { id: result.id }, true );

      } else throw result;

    } )

    .then( function( ) {

      return cb();

    } )

    .catch( function( err ) {

      log( 'error', err );

      if ( err ) {

        if ( err.statusCode && err.statusCode != 201 ) {

          log( 'error', err.message );

          _handleStatusCode( { agenda: agenda, instance: instance, statusCode: err.statusCode, refresh: store.refresh }, 'publish', function( err ) {

            if ( err ) return cb( err );

            return cb();

          } );

        } else return cb( err );

      }

    } );

  },

  patch = function( values, cb ) {

    log( 'info', 'patching event with values : %s', JSON.stringify( values ) );

    var instance,

    agenda,

    store,

    bearer,

    data;

    wn.call( model.reviews().get, { id: values.agendaId } )

    .then( function( review ) {

      agenda = model.reviews().instance( review );

      return wn.call( model.events().get, { id: values.eventId } );

    } )

    .then( function( e ) {

      instance = model.events().instance( e );

      store = agenda.getStore( 'swapcard', null );

      bearer = 'Bearer ' + store.access;

      return wn.call( _getEventData, instance );


    } )

    .then( function( eventSwapcard ) {

      var swapcardStore = instance.getStore( 'swapcard', {} );

      data = JSON.stringify( eventSwapcard );

      return wn.call( _request, 'PATCH', config.bridges.swapcard.baseSite + '/v1/events/' + swapcardStore.id, { 'Content-Type': 'application/json', 'Authorization': bearer, 'Accept-Language': 'fr,eng' }, data, null );

    } )

    .then( function( result ) {

      if ( result.statusCode == 204 ) {

        log( 'info', 'patch successful' );

        return cb();

      } else throw result;

    } )

    .catch( function( err ) {

      if ( err ) {

        log( 'error', typeof err == 'string' ? err : JSON.stringify( err ) );

        if ( err.statusCode && err.statusCode != 204 ) {

          log( 'error', err.message );

          _handleStatusCode( { agenda: agenda, instance: instance, statusCode: err.statusCode, refresh: store.refresh }, 'update', function( error ) {

            if ( error ) return cb( error );

            return cb();

          } );

        } else cb( err );

      }

    } );
  },

  remove = function( values, cb ) {

    log( 'info', 'removing event with values : %s', JSON.stringify( values ) );

    var instance,

    agenda,

    store,

    bearer,

    data;

    wn.call( model.reviews().get, { id: values.agendaId } )

    .then( function( review ) {

      log( 'info', 'got agenda %s', JSON.stringify( review ) );

      agenda = model.reviews().instance( review );

      return wn.call( model.events().getDeleted, { id: values.eventId } );

    } )

    .then( function( e ) {

      log( 'info', 'loaded deleted event data %s', JSON.stringify( e ) );

      var swapcardStore = e.store.store.swapcard;

      store = agenda.getStore( 'swapcard', null );

      bearer = 'Bearer ' + store.access;

      return wn.call( _request, 'delete', config.bridges.swapcard.baseSite + '/v1/events/' + swapcardStore.id, { 'Content-Type': 'application/json', 'Authorization': bearer, 'Accept-Language': 'fr,eng' }, "", null );

    } )

    .then( function( result ) {

      log( 'info', 'swapcard request returned %s', JSON.stringify( result ) );

      if ( result.statusCode == 204 ) {

        log( 'delete succeed' );

        return cb();

      } else throw result;

    } )

    .catch( function( err ) {

      if ( err ) {

        log( 'error', typeof err == 'string' ? err : JSON.stringify( err ) );

        if ( err.statusCode && err.statusCode != 204 ) {

          log( 'error', err.message );

          _handleStatusCode( { agenda: agenda, instance: instance, statusCode: err.statusCode, refresh: store.refresh }, 'delete', function( error ) {

            if ( error ) return cb( error );

            return cb();

          } );

        } else cb( err );

      }

    } );

  },

  _loadValues = function( agenda, action ) {

    return function( e, cb ) {

      e = model.events().instance( e );

      if ( action == 'publish' ) {

        if ( e.getStore( 'swapcard', null ) != null ) action = 'update';

      }

      if ( action == 'update' ) {

        if ( e.getStore( 'swapcard', null ) == null ) action = 'publish';

      }

      addJob( e.id, agenda.id, action );

      cb();

    };

  },

  _request = function( method, url, header, data, token, cb ) {

    var parsedUrl = URL.parse( url, false, true ),

    req = https.request({
      hostname: parsedUrl.host,
      port: 443,
      path: parsedUrl.pathname,
      method: method,
      headers: lib.extend( header, { 'Content-Length': data ? Buffer.byteLength( data ) : 0 } )
    }, function( res ) {

      var response = [];

      res.on( 'error', function( e ) {

        log( 'error', 'Error during the request %s', JSON.stringify( e ) );

        return cb( e );

      } );

      res.setEncoding( 'utf8' );

      res.on( 'data', function ( chunk ) {

        response.push( chunk );

      });

      res.on( 'end', function() {

        var result = {};

        if ( response.length ) {

          try {

            result = JSON.parse( response );
            
          } catch( e ) {

            log( 'error', 'Invalid JSON response' );

            return cb( 'Invalid JSON response' );

          }

        }

        result.statusCode = res.statusCode;

        cb( null, result );

      } );

    } );

    req.write( data );

    req.end();

  },

  _handleStatusCode = function( values, method, cb ) {

    if ( values.statusCode == 401 ) {

      log( 'info', 'access token is expired' );

      getAccessToken( values.agenda.slug, values.refresh, 'refresh_token', function( err, a, r ) {

        if ( err && err.statusCode == 400 ) notification.addJob( lib.extend( values, { number: 30, action: 'process' } ) );

        if ( err ) return cb( err );

        log( 'info', 'successfully refreshed access token' );

        values.agenda.setStore( 'swapcard', { access: a, refresh: r }, true, function( err ) {
          
          if ( err ) return cb( err );

          exposed[ method ]( { eventId: values.instance.id, agendaId: values.agenda.id, type: 'swapcard' }, cb );

        } );

      } );

    } else if ( values.statusCode == 404 ) {

      if ( method == 'update' ) {
       
        return exposed[ 'publish' ]( { eventId: values.instance.id, agendaId: values.agenda.id, type: 'swapcard' }, cb );

      } else {

        return cb();
        
      }

    } else {

      return cb();

    }

  },

  _getEventData = function( eventInstance, cb ) {

    var data = {},

    strt = eventInstance.locations[ 0 ].timings[ 0 ].start,

    end = eventInstance.locations[ 0 ].timings[ eventInstance.locations[ 0 ].timings.length - 1 ].end,

    beginsAt = moment( strt ).format( "YYYY-MM-DD HH:mm:ss" ),

    endsAt = moment( end ).format( "YYYY-MM-DD HH:mm:ss" );

    data[ 'name' ] = eventInstance.getTitle();
    data[ 'description' ] = eventInstance.getDescription() + '\n\n' + eventInstance.getFreeText();
    data[ 'place' ] = eventInstance.locations[ 0 ].name + ' - ' + eventInstance.locations[ 0 ].address;
    data[ 'eventType' ] = 'PUBLIC';
    data[ 'logo' ] = {};
    data.logo[ 'data' ] = ( eventInstance.getImage( true ) || config.aws.staticBucketPath + config.bridges.swapcard.emptyImage ).replace('cibultest', 'cibul');
    data[ 'latitude' ] = eventInstance.locations[ 0 ].latitude;
    data[ 'longitude' ] = eventInstance.locations[ 0 ].longitude;
    data[ 'beginsAt' ] = beginsAt;
    data[ 'endsAt' ] = endsAt;

    cb( null, data );

  };

  var exposed = {
    connectService: connectService,
    getAccessToken: getAccessToken,
    processEvents: processEvents,
    unlinkEvents: unlinkEvents,
    addJob: addJob,
    publish: create,
    update: patch,
    delete: remove
  };

  return exposed;

};