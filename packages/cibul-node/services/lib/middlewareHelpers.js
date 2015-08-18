"use strict";

module.exports = {
  compareModifiedSince: compareModifiedSince
}


function compareModifiedSince( timestamp, req, res, next ) {

  if ( timestamp && typeof timestamp == 'object' ) {

    timestamp = timestamp.toString();

  }

  if ( req.headers[ 'if-modified-since' ] === timestamp ) {

    req.log( 'marked as not modifed' );

    res.status( 304 ).end();

    return;

  }

  req.log( 'marked as fresh, setting last-modified' );

  res.set( 'Last-Modified', timestamp );

  next();

}