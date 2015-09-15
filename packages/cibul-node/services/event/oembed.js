"use strict";

var log = require( 'logger' )( 'oembed' ),

lib = require( '../../lib/lib' ),

coms = require( '../../lib/coms' ),

config = require( '../../config' ),

async = require( 'async' ),

cbm = require( '../model' ),

https = require( 'https' ),

processing = false;

module.exports = {
  addJob: addJob,    // queue job on job stack
  process: process,  // process job ( fetch data from service )
  setComs: setComs   // for testing
}


function process( values, cb ) {

  var links;

  if ( processing ) {

    // requeue

    setTimeout( function() { addJob( values ); }, 1000 );

    cb();

    return;

  }

  processing = true;

  cbm.events().get( { id: values.id }, function( err, event ) {

    if ( err || !event ) {

      log( 'error', err || 'no event could be loaded' );

      processing = false;

      cb( err || 'no event could be loaded' );

      return;

    }

    links = cbm.events().instance( event ).getLinks();

    async.eachSeries( links, _processLink( links ), function( err ) {

      if ( err ) return cb( true );

      cbm.events().instance( event ).updateLinks( links, true, function( err ) {

        processing = false;

        cb();

      });


    } );

  });

}

function addJob( eventId, cb ) {

  coms.queue( 'jobs', {
    type: 'event/oembed',
    action: 'process',
    id: eventId
  }, cb );

}


/**
 * give an iterator handling a request to oembed service
 * and updating links array
 */

function _processLink( links ) {

  return function( processedLink, cb ) {

    var res, linksItem;

    if ( !_isOembeddable( processedLink.link ) ) {

      return cb();

    }

    if ( processedLink.code ) {

      log( 'code is already in hand, bypassing request');

      return cb();

    }

    _getAndParse( config.oembed.res + '?api_key=' + config.oembed.key + '&url=' + encodeURI( processedLink.link ), function( err, data ) {

      if ( err ) return cb();

      linksItem = lib.getByAttr( links, { link: processedLink.link } );

      if ( linksItem === null ) {

        links.push( { link: processedLink.link, code: data.html ? data.html : null } );

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

  https.get( url, function( res ) {

    if ( res.statusCode !== 200 ) {

      // log error and fa'ggetabatit

      log( 'error', 'received a status code %s from %s', res.statusCode, url );

      return cb( true );

    }

    res.on( 'data', function( chunk ) {

      data += chunk;

    });

    res.on( 'end', function() {

      try {

        data = JSON.parse( data );

      } catch( e ) {

        log( 'error', 'invalid JSON received' );

        return cb( e );

      }

      cb( null, data );

    });

  } );

}



function _isOembeddable( link ) {

  var is = false;

  config.oembed.platforms.forEach( function( platform ) {

    if ( is ) return;

    if ( link.indexOf( platform ) !== -1 ) {

      is = true;

    }

  });

  return is;

}

function setComs( c ) {

  coms = c;

}