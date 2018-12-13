"use strict";

const knexLib = require( 'knex' );
const logs = require( '@openagenda/logs' );

var mw = require( './middleware' ),

  agendaStakeholders,

  w = require( 'when' ),

  config,

  knex;

module.exports = {
  init,
  mw,
  stakeholders: {
    list: agendaStakeholdersList
  }
};

function init( c, cb ) {

  config = c;

  w( c )

  .then( () => {

    agendaStakeholders = c.services.agendaStakeholders;

    if ( c.logger ) {

      logs.setModuleConfig( c.logger );

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

  .done( () => {

    if ( cb ) {
      cb();
    }

  } );

}

function agendaStakeholdersList( agendaId, query, offset, limit, options, cb ) {

  w( {
    agendaId,
    query,
    offset,
    limit,
    options
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

  agendaStakeholders( parseInt( v.agendaId ) ).list( query, v.offset, v.limit, v.options, ( err, stakeholders, total ) => {

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
