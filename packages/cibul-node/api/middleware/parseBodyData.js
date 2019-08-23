"use strict";

const _ = require('lodash');
const bodyParser = require('body-parser');
const qs = require('qs');

module.exports = [
  (req, res, next) => {

    let parser = bodyParser.json();

    if (
      ( req.headers['content-type'] !== 'application/json' )
      && req.method !== 'PATCH'
    ) {
      parser = bodyParser.raw({
        inflate: true,
        limit: '500kb',
        type: 'text/plain'
      });
    }

    parser(req, res, next);

  },
  ( req, res, next ) => {

    if ( _.isBuffer( req.body ) ) {

      req.body = qs.parse( req.body.toString() );

    }

    req.parsedData = req.body.data || req.body;

    try {
      if ( typeof req.parsedData === 'string' ) {
        req.parsedData = JSON.parse( req.parsedData );
      }
    } catch ( e ) {

      return res.status( 400 ).json( {
        error: 'provided json is invalid',
        agendaUid: req.params.agendaUid,
        body: req.body
      } );

    }

    next();
  }
]
