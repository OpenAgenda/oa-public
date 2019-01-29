"use strict";

var log = require( '@openagenda/logs' )( 'swapcard' ),

https = require( 'https' ),

URL = require( 'url' ),

coms = require( '../../lib/coms' ),

async = require( 'async' ),

moment = require( 'moment' ),

OAuth2 = require( 'oauth' ).OAuth2,

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../../lib/lib' );

module.exports = function ( model, config ) {

  var oauth2 = new OAuth2( config.bridges.swapcard.clientID,
    config.bridges.swapcard.clientSecret,
    config.bridges.swapcard.baseSite,
    config.bridges.swapcard.authorizePath,
    config.bridges.swapcard.accessTokenPath,
    null
  );

  moment.lang( 'fr' );

  return {
    connectService: connectService,
    getAccessToken: getAccessToken,
    processEvents: processEvents,
    unlinkEvents: unlinkEvents,
    addJob: addJob,
    publish: create,
    update: patch,
    delete: remove
  };

  function create( values, cb ) { createOrPatch( values, cb ); }

  function patch( values, cb ) { createOrPatch( values, cb ); }

  function createOrPatch( values, cb ) {

    log( 'info', {
      message: 'createOrPatch values %s',
      agendaId: values.agendaId,
      eventId: values.eventId
    }, JSON.stringify( values ) );

    w( {
      agendaId: values.agendaId,
      eventId: values.eventId,
      agenda: false,
      agendaScConfig: false,
      event: false,
      scEvent: false, // the stringified swapcard event data
      eventScConfig: false,
      result: false
    })

    .then( _getAgenda )

    .then( _getEvent )

    .then( _buildSwapcardData )

    .then( _defineMethodAndRoute )

    .then( _doRequest )

    .then( _verifyStatusCode )

    .done( function( v ) {

      if ( v.result.statusCode == 201 ) {

        log( 'info', { message: 'successfully created event', agendaId: v.agendaId, eventId: v.eventId } );

        v.event.setStore( 'swapcard', { id: v.result.id }, true, cb );

      } else {

        log( 'info', { message: 'successfully patched event', agendaId: v.agendaId, eventId: v.eventId } );

        cb();

      }

    }, function( err ) {

      if ( typeof err == 'object' && err.retry ) {

        createOrPatch( values, cb );

      } else {

        cb( err );

      }

    });

  }

  function processEvents( agenda, action, cb ) {

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

  }

  /**
   * link an account or an agenda to an other application's account
   */

  function connectService( req, res ) {

    var stateObj = {
      slug: req.agenda.slug,
      dsjid986: 58
    },

    stateObj = JSON.stringify( stateObj ),

    decodedState = new Buffer( stateObj ).toString( 'base64' );

    var params = {
      redirect_uri: config.bridges.swapcard.redirect,
      scope: 'scope_event_rw',
      response_type: 'code',
      state: decodedState
    };

    var url = oauth2.getAuthorizeUrl( params );

    res.redirect( url );

  }

  function getAccessToken( slug, code, type, cb ) {

    log( 'info', { slug: slug, type: type, message: 'getting access token' } );

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

      if ( err ) {

        return cb( JSON.parse( err.data ).error );

      }

      log( 'info', { slug: slug, type: type, message: 'access token retrieved' } );

      cb( null, access, refresh );

    } );

  }

  function addJob( eventId, agendaId, action ) {

    coms.queue( 'jobs', { type: 'swapcard', action: action, eventId: eventId, agendaId: agendaId } );

  }

  function unlinkEvents( agenda, cb ) {

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

  }


  function _verifyStatusCode( v ) {

    if ( [ 201, 204 ].indexOf( v.result.statusCode ) !== -1 ) {

      return v;

    }

    return w.promise( function( rs, rj ) {

      if ( !v.result.statusCode ) {

        rj( v.result );

      } else if ( v.result.statusCode == 401 ) {

        log( 'info', 'access token is expired' );

        getAccessToken( v.agenda.slug, v.agendaScConfig.refresh, 'refresh_token', function( err, a, r ) {

          if ( err && err.statusCode == 400 ) {

            // notification.notify.expiredSwapcard( { agendaId: values.agenda.id } );

          }

          if ( err ) return rj( err );

          log( 'info', 'successfully refreshed access token' );

          v.agenda.setStore( 'swapcard', { access: a, refresh: r }, true, function( err ) {

            if ( err ) return rj( err );

            log( 'info', 'updated agenda %s store with new access & refresh values', v.agenda.id );

            return rj( { retry: true } );

          });

        } );

      } else {

        rj( v.result );

      }

    });

  }


  function _doRequest( v ) {

    return w.promise( function( rs, rj ) {

      _request( v.method, v.route, {
        'Authorization': 'Bearer ' + v.agendaScConfig.access,
        'Content-Type': 'application/json',
        'Accept-Language': 'fr,eng'
      }, v.scEvent, function( err, result ) {

        if ( err ) return rj( err );

        v.result = result;

        rs( v );

      } );

    });

  }


  /**
   * it is either a patch or a create
   */

  function _defineMethodAndRoute( v ) {

    if ( v.eventScConfig.id ) {

      log( 'will patch' );

      v.method = 'PATCH';

      v.route = config.bridges.swapcard.baseSite + '/v1/events/' + v.eventScConfig.id;

    } else {

      log( 'will post' );

      v.method = 'POST';

      v.route = config.bridges.swapcard.baseSite + '/v1/events';

    }

    return v;

  }


  function _getEvent( v ) {

    return w.promise( function( rs, rj ) {

      model.events().get( { id: v.eventId }, function( err, event ) {

        if ( err ) return rj( 'did not find event' );

        v.event = model.events().instance( event );

        v.eventScConfig = v.event.getStore( 'swapcard', {} );

        log( 'retrieved event' );

        rs( v );

      });

    });

  }


  function _getAgenda( v ) {

    return w.promise( function( rs, rj ) {

      model.agendas().get( { id: v.agendaId }, function( err, agenda ) {

        if ( err ) return rj( 'could not retrieve agenda' );

        v.agenda = model.agendas().instance( agenda );

        v.agendaScConfig = v.agenda.getStore( 'swapcard', null );

        log( 'retrieved agenda' );

        rs( v );

      } );

    });

  }


  function remove( values, cb ) {

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

  }

  function _loadValues( agenda, action ) {

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

  }

  function _request( method, url, header, data, cb ) {

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

  }

  function _handleStatusCode( values, method, cb ) {

    if ( values.statusCode == 401 ) {

      log( 'info', 'access token is expired' );

      getAccessToken( values.agenda.slug, values.refresh, 'refresh_token', function( err, a, r ) {

        if ( err && err.statusCode == 400 ) {

          // notification.notify.expiredSwapcard( { agendaId: values.agenda.id } );

        }

        if ( err ) return cb( err );

        log( 'info', 'successfully refreshed access token' );

        values.agenda.setStore( 'swapcard', { access: a, refresh: r }, true, function( err ) {

          if ( err ) return cb( err );

          log( 'info', 'updated agenda %s store with new access & refresh values', values.agenda.id );

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

  }

  function _buildSwapcardData( v ) {

    return w.promise( function( rs, rj ) {

      var start = v.event.locations[ 0 ].timings[ 0 ].start,

      end = v.event.locations[ 0 ].timings[ v.event.locations[ 0 ].timings.length -1 ].end;

      v.scEvent = JSON.stringify( {
        name: v.event.getTitle(),
        description: v.event.getDescription() + '\n\n' + v.event.getFreeText(),
        place: v.event.locations[ 0 ].name + ' - ' + v.event.locations[ 0 ].address,
        eventType: 'PUBLIC',
        logo: {
          data: ( v.event.getImage( true ) || config.aws.staticBucketPath + config.bridges.swapcard.emptyImage ).replace('cibultest', 'cibul')
        },
        latitude: v.event.locations[ 0 ].latitude,
        longitude: v.event.locations[ 0 ].longitude,
        beginsAt: moment( start ).format( "YYYY-MM-DD HH:mm:ss" ),
        endsAt: moment( end ).format( "YYYY-MM-DD HH:mm:ss" )
      } );

      log( 'info', { message: 'prepared swapcard event data', data: v.scEvent } );

      rs( v );

    });

  }

};

module.exports.initless = true;
