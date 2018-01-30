"use strict";

const _ = require( 'lodash' );

let config; // defined at init

module.exports = {
  events,
  suggestions,
  init
}

function suggestions( req, res, next ) {

  req.events = [];

  if ( !_pre( req, res, next ) ) return;

  config.interfaces.suggestions( req.agendaUid, _.get( req.query, 'sample', {} ), { showAll: !!req.access }, _respond.bind( null, req, res, next ) );

}

/**
 * forward event search to interfaced service
 */
function events( req, res, next ) {

  req.events = [];

  if ( !_pre( req, res, next ) ) return;

  config.interfaces.events( req.agendaId, req.query, { showAll: !!req.access }, _respond.bind( null, req, res, next ) );

}

function _pre( req, res, next ) {

  if ( !req.agendaId && !req.agendaUid ) {

    next( 'no agenda was specified' );

    return false;

  }

  if ( !_.keys( req.query ).length ) {

    next();

    return false;

  }

  return true;

}

function _respond( req, res, next, err, events ) {

  if ( err ) return next( err );

  req.events = events;

  next();

}


function init( c ) {

  config = c;

}