"use strict";

var logger = require( '@openagenda/basic-logger' ), log,

  validators = require( '@openagenda/validators' ),

  service, config,

  agendas,

  utils = require( '@openagenda/utils' );

module.exports = {
  init,
  agendas: {
    list,
    get,
    set
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

  agendas = c.services.agendas;

}


function list( req, res, next ) {

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

  agendas.list( query, offset, limit, {
    total: true,
    detailed: true,
    private: null
  }, ( err, agendas, total ) => {

    if ( err ) return next( err );

    return res.json( { agendas, total } );

  } );

}

function get( req, res, next ) {

  agendas.get( req.query, { detailed: true, internal: true, private: null }, ( err, agenda ) => {

    if ( err ) return next( err );

    return res.json( agenda );

  } );

}

function set( req, res, next ) {

  agendas.set( { uid: req.params.uid }, req.body, {
    internal: true,
    protected: false,
    private: null,
    context: req.context || null
  }, ( err, result ) => {

    if ( err ) return next( err );

    return res.json( result );

  } );

}


function agendaStakeholdersList( req, res, next ) {

  var agendaId = req.query.agendaId,

    query = { order: 'credential' },

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

  service.stakeholders.list( agendaId, query, offset, limit, { deletedUser: null }, ( err, stakeholders, total ) => {

    if ( err ) return next( err );

    return res.json( {
      stakeholders: stakeholders,
      total: total
    } );

  } );

}
