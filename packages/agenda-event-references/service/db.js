// need to create db if not exists
// need to create table if not exists
// 
// 
// set( agendaId, eventId, referredEventIds, cb )

const knexLib = require( 'knex' );
const createIfNotExists = require( 'mysql-utils/createIfNotExists' );
const w = require( 'when' );


const schemaFields = [
  'id bigint auto_increment',
  'agenda_id bigint not null',
  'event_id bigint not null',
  'ref_event_id bigint not null',
  'index agenda_id_idx (agenda_id)',
  'index event_id_idx (event_id)',
  'primary key(id)'
];

// these are set at init
let config, knex;

module.exports = {
  get,
  set,
  clear,
  init
}

function clear( agendaId, eventId, cb ) {

  w( {
    agendaId,
    eventId
  } )

  .then( _clearReferences )

  .done( v => { cb() }, cb );

}

function get( agendaId, eventId, cb ) {

  w( {
    agendaId,
    eventId,
    result: []
  } )

  .then( _getReferences )

  .done( v => { cb( null, v.result ) } );

}

function set( agendaId, eventId, referredEventIds, cb ) {

  w( {
    agendaId,
    eventId,
    referredEventIds,
    result: []
  } )

  .then( _clearReferences )

  .then( _insertReferences )

  .then( _getReferences )

  .done( v => { cb( null, v.result ); }, cb );

}

function init( c, cb ) {

  config = c;

  createIfNotExists( {
    config: config.mysql,
    database: config.mysql.database,
    table: config.schema,
    fields: schemaFields
  }, err => {

    if ( err ) return cb( err );

    knex = knexLib( {
      client: 'mysql',
      connection: config.mysql
    } );

    cb();

  } );

}

function _getReferences( v ) {

  return knex( config.schema )

  .where( {
    agenda_id: v.agendaId,
    event_id: v.eventId
  } )

  .then( result => {

    v.result = result.map( r => r.ref_event_id );

    return v;

  } );

}

function _clearReferences( v ) {

  return knex( config.schema )

  .where( {
    agenda_id: v.agendaId,
    event_id: v.eventId
  } )

  .del()

  .then( delCount => {

    v.deleted = delCount;

    return v;

  } );

}

function _insertReferences( v ) {

  return knex.batchInsert( 
    config.schema,
    v.referredEventIds.map( id => ( {
      agenda_id: v.agendaId,
      event_id: v.eventId,
      ref_event_id: id
    } ), 10 )
  )

  .then( result => {

    return v;

  } );

}