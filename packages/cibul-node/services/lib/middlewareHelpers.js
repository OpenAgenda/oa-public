"use strict";

module.exports = {
  compareModifiedSince
}

function compareModifiedSince( timestamp, req, res, next ) {

  if ( timestamp && typeof timestamp == 'object' ) {

    timestamp = JSON.stringify( timestamp ).replace( /"/g, '' )

  }

  if ( timestamp && ( req.headers[ 'if-modified-since' ] === timestamp ) ) {

    req.log( 'marked as not modifed' );

    res.status( 304 ).end();

    return;

  }

  req.log( 'marked as fresh, setting last-modified' );

  res.set( 'Last-Modified', timestamp );

  next();

}