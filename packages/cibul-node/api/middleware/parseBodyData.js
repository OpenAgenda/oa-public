"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const qs = require( 'qs' );

module.exports = [
  ( req, res, next ) => {

    const parser = req.method === 'PATCH' ? bodyParser.json() : bodyParser.raw( { inflate: true, limit: '500kb', type: 'text/plain' } );

    parser( req, res, next );

  },
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
