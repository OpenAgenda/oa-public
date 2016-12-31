"use strict";

/**
 * this is a little test server. It sends an object
 * when it receives a GET request, updates it when
 * it receives a POST
 */

const http = require( 'http' );

let delay = 0,

data = { random: 'data' }

module.exports = http.createServer( ( req, res ) => {

  setTimeout( () => {

    res.setHeader( 'Content-Type', 'application/json' );

    if ( req.method === 'POST' ) {

      let postedData = '';

      req.on('data', chunk => postedData += chunk );

      req.on('end', () => {

        data = JSON.parse( postedData );

        res.end( postedData );

      });

    } else {

      res.end( JSON.stringify( data ) );

    }

  }, delay || 0 );

} );

module.exports.resetTestConfig = config => {

  if ( config.delay !== undefined ) {

    delay = config.delay;

  }

  if ( config.data !== undefined ) {

    data = config.data;

  } 

}

module.exports.getTestConfig = () => {

  return { delay, data };

}