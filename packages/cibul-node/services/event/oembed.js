"use strict";

const log = require( '@openagenda/logs' )( 'services/event/oembed' ),

  lib = require( '../../lib/lib' ),

  coms = require( '../../lib/coms' ),

  config = require( '../../config' ),

  async = require( 'async' ),

  cbm = require( '../model' ),

  https = require( 'https' ),

  validateEmail = require( '@openagenda/validators/email' )(),

  q = require( '@openagenda/queue' )( config.queues.oembed, { redis: config.redis } );


module.exports = {
  task,
  process: function( v, cb ) {

    log( 'info', 'dud process for %s', JSON.stringify( v ) );

    cb();

  }
}



function task() {

  coms.subscribe( config.mainChannel, function( err, action ) {

    if ( err ) return;

    if ( [ 'event.update', 'event.publish', 'event.create' ].indexOf( action.name ) == -1 ) {

      return;

    }

    q( action.values.id );

  } );


  q.setConsumer( _processLinks );

  q.launch( { interval: 10 } );

}


function _processLinks( id, cb ) {

  log( 'processing links for event id %s', id );

  cbm.events().get( { id }, function( err, event ) {

    if ( err || !event ) {

      log( 'error', err || 'no event could be loaded' );

      return cb( err || 'no event could be loaded' );

    }

    let links = cbm.events().instance( event ).getLinks();

    async.eachSeries( links, _processLink( links ), err => {

      if ( err ) {

        log( 'error', err );

        return cb();

      }

      cbm.events().instance( event ).updateLinks( links, true, err => {

        if ( err ) log( 'error', err );

        cb();

      } );

    } );

  });

}


/**
 * give an iterator handling a request to oembed service
 * and updating links array
 */

function _processLink( links ) {

  return function( processedLink, cb ) {

    let res, linksItem;

    if ( _isImage( processedLink.link ) ) {

      linksItem = lib.getByAttr( links, { link: processedLink.link } );

      linksItem.code = '<img src="' + processedLink.link + '"/>';

      return cb();

    } else if ( _isEmail( processedLink.link ) ) {

      return cb();

    } else if ( !_isOembeddable( processedLink.link ) ) {

      return cb();

    }

    if ( processedLink.code ) {

      log( 'code is already in hand, bypassing request');

      return cb();

    }

    _getAndParse( config.oembed.res + '?api_key=' + config.oembed.key + '&url=' + encodeURIComponent( processedLink.link ), function( err, data ) {

      if ( err ) {

        log( 'error', err );

        return cb();

      }

      log( 'retrieved %s', JSON.stringify( data ) );

      linksItem = lib.getByAttr( links, { link: processedLink.link } );

      if ( linksItem === null ) {

        links.push( {
          link: processedLink.link,
          code: data.html ? data.html : null
        } );

      } else {

        linksItem.code = data.html ? data.html : null;

      }

      cb();

    } );

  }

}


function _getAndParse( url, cb ) {

  var data = '';

  log( 'fetching %s', url );

  https.get( url, res => {

    let errored = false;

    res.on( 'error', err => {

      errored = true;

      cb( err );

    } );

    res.on( 'data', chunk => {

      if ( errored ) return;

      data += chunk;

    });

    res.on( 'end', function() {

      if ( errored ) return;

      try {

        data = JSON.parse( data );

      } catch( e ) {

        log( 'error', 'invalid JSON received' );

        return cb( e );

      }

      if ( res.statusCode !== 200 ) {

        log( 'error', 'received a status code %s from %s: %s', res.statusCode, url, data );

      }

      cb( res.statusCode == 200 ? null : res.statusCode, data );

    });

  } )

  .on( 'error', cb );

}


function _isImage( link ) {

  return /\.(png|jpg|bmp|jpeg|gif)$/.test( link );

}

function _isEmail( link ) {

  try {

    validateEmail( link );

  } catch( e ) {

    return false;

  }

  return true;

}


function _isOembeddable( link ) {

  var is = false;

  config.oembed.platforms.forEach( function( platform ) {

    if ( is ) return;

    log( 'evaluating link %s for platform %s', link, platform );

    if ( ( new RegExp( platform ) ).test( link ) ) {

      log( 'link %s matches platform %s', link, platform );

      is = true;

    }

  });

  return is;

}

function setComs( c ) {

  coms = c;

}
