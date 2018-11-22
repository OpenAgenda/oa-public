"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const qs = require( 'qs' );

module.exports = [ 
  bodyParser.raw( {
    inflate: true, 
    limit: '500kb', 
    type: 'text/plain'
  } ),
  ( req, res, next ) => {

    if ( _.isBuffer( req.body ) ) {

      req.body = qs.parse( req.body.toString() );

    }

    try {

      req.parsedData = JSON.parse( req.body.data );

    } catch ( e ) {

      return res.status( 400 ).json( {
        error: 'provided json is invalid',
        agendaUid: req.params.agendaUid,
        json: req.body.data
      } );

    }

    next();
  }
]
