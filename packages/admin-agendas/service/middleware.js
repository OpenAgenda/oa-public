"use strict";

var logger = require( 'basic-logger' ), log,

  validators = require( 'validators' ),

  React = require( 'react' ),

  ReactDOMServer = require( 'react-dom/server' ),

  Body = React.createFactory( require( '../components/lib/Body' ) ),

  service, config,

  utils = require( 'utils' );

module.exports = {
  init,
  agendas: {
    list: agendasList
  },
  stakeholders: {
    list: agendaStakeholdersList
  }
};

function init( s, c ) {

  service = s;

  config = utils.extend( {
    limit: {
      default: 20,
      max: 100
    }
  }, c.mw || {} );

}


function agendasList( req, res, next ) {

  var query = req.query.oas,

    offset = 0,

    limit = config.limit.default,

    page = 1;

  try {

    page = validators.number( {
      min: 1,
      default: 1
    } )( req.query.searchPage );

    offset = ( page - 1 ) * limit;

  } catch ( e ) {
  }

  if ( !req.xhr ) return next();

  service.agendas.list( query, offset, limit, ( err, agendas, total ) => {

    if ( err ) return next( err );

    return res.json( {
      agendas: agendas,
      total: total
    } );

  } );

}


function agendaStakeholdersList( req, res, next ) {

  var agendaId = req.query.agendaId,

    query = {},

    offset = 0,

    limit = config.limit.default,

    page = 1;

  try {

    page = validators.number( {
      min: 1,
      default: 1
    } )( req.query.stakeholdersPage );

    offset = ( page - 1 ) * limit;

  } catch ( e ) {
  }

  service.stakeholders.list( agendaId, query, offset, limit, ( err, stakeholders, total ) => {

    if ( err ) return next( err );

    return res.json( {
      stakeholders: stakeholders,
      total: total
    } );

  } );

}