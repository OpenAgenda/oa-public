"use strict";

const knexLib = require( 'knex' );

var logger = require( 'basic-logger' ), log,

  mw = require( './middleware' ),

  agendas = require( 'agendas' ),

  agendaStakeholders = require( 'agenda-stakeholders' ),

  w = require( 'when' ),

  config,

  knex;

module.exports = {
  init,
  mw,
  agendas: {
    list: agendasList
  },
  stakeholders: {
    list: agendaStakeholdersList
  }
};

function init( c, cb ) {

  config = c;

  w( c )

  .then( () => {

    if ( c.logger ) {

      logger.setLogger( c.logger );

    }

  } )

  .then( () => {

    knex = knexLib( {
      client: 'mysql',
      connection: c.mysql
    } );

  } )

  .then( () => {

    mw.init( require( './' ), c );

  } )

  .then( () => {

    agendas.init( c );

  } )

  .then( () => {

    agendaStakeholders.init( c, w.resolve );

  } )

  .done( () => {

    log = logger( 'admin' );

    if ( cb ) {
      cb();
    }

  } );

}

function agendasList( query, offset, limit, cb ) {

  query = Object.assign( {
    total: 1,
    detailed: 1
  }, query );

  agendas.list( query, offset, limit, cb );

}

function agendaStakeholdersList( agendaId, query, offset, limit, cb ) {

  w( {
    agendaId,
    query,
    offset,
    limit
  } )

  .then( _agendaStakeholdersList )

  .then( _getStakeholdersDetails )

  .then( _mergeDetailsIntoStakeholders )

  .done( v => {

    cb( null, v.stakeholders, v.total );

  }, cb );

}

function _agendaStakeholdersList( v ) {

  var d = w.defer();

  var query = Object.assign( {
    total: 1
  }, v.query );

  agendaStakeholders( v.agendaId ).list( query, v.offset, v.limit, ( err, stakeholders, total ) => {

    if ( err ) d.reject( err );

    v.stakeholders = stakeholders;
    v.total = total;

    d.resolve( v );

  } );

  return d.promise;

}

function _getStakeholdersDetails( v ) {

  var usersIdList = v.stakeholders.map( obj => obj.userId );

  return knex.transaction( trx => {

    return trx.table( config.schemas.user )

    .select( 'id', 'full_name', 'username', 'email', 'image', 'facebook_uid', 'twitter_screen_name', 'culture',
      'is_activated', 'created_at', 'updated_at', 'twitter_id', 'google_id', 'uid', 'last_signin' )

    .whereIn( 'id', usersIdList );

  } )

  .then( users => {

    v.users = users;

    return v;

  } );

}

function _mergeDetailsIntoStakeholders( v ) {

  v.stakeholders = v.stakeholders.map( stakeholder => {

    stakeholder.user = v.users.filter( user => user.id == stakeholder.userId )[0];

    return stakeholder;

  } );

  return v;

}