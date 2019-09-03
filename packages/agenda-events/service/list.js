"use strict";

const _ = require( 'lodash' );

const VError = require( 'verror' );

const validate = require( '../iso/validate' );

const validateListQuery = require('./lib/validateListQuery');
const extractListParameters = require('./lib/extractListParameters');
const validateOptions = require('./lib/validateOptions');

let config, knex;

module.exports = _.extend( list, {
  init: ( c, k ) => { config = c; knex = k },
  byUserUid: listByUserUid,
  byEventUid: listByEventUid,
  byLastId: listByLastId
} );

async function list(agendaUid, query, offset, limit, options) {
  const params = extractListParameters(agendaUid, query, offset, limit, options);
  const {
    decorate
  } = validateOptions(params.options);
  if (!knex) {
    throw new VError( 'agenda-events service is not configured' );
  }

  const items = (await _list(
    params.query,
    _.pick(params, ['offset', 'limit']))
  ).map(validate);

  if (decorate.includes('member') && _.get(config, 'interfaces.getMembers')) {
    const members = await config.interfaces.getMembers(items);

    items.forEach(item => {
      item.member = _.find(members, { userUid: item.userUid });
    });
  }

  return {
    items,
    total: await _total(params.query)
  }
}

async function listByLastId( agendaUid, query, lastId, limit = 20 ) {

  const cleanQuery = { agendaUid };

  const nav = {}

  if ( !_.isObject( arguments[ 1 ] ) ) {

    _.extend( cleanQuery, validateListQuery( {} ) );

    _.extend( nav, { lastId: query, limit: lastId || 20 } );

  } else {

    _.extend( cleanQuery, validateListQuery( query ) );

    _.extend( nav, { lastId, limit } );

  }

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  const items = await _list( cleanQuery, nav );

  return {
    items: items.map( validate ),
    total: await _total(cleanQuery),
    lastId: _.get( _.last( items ), 'id' )
  }

}

async function listByUserUid( userUid, offset, limit ) {
  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  return {
    items: ( await _list( { userUid }, { offset, limit } ) ).map( validate ),
    total: await _total({ userUid })
  }
}

async function listByEventUid( eventUid, offset = 0, limit = 20 ) {
  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  return {
    items: ( await _list( { eventUid }, { offset, limit } ) ).map( validate ),
    total: await _total({ eventUid })
  }
}

function _total( query ) {
  const k = knex( config.schemas.agendaEvent );

  _query( k, query );

  return k.count( 'id as total' )

    .then( rows => rows[ 0 ][ 'total' ] );
}

function _list(query, nav) {
  const {
    limit,
    offset,
    lastId
  } = nav;

  const fields = [ 'agenda_uid', 'event_uid', 'user_uid', 'state', 'featured', 'legacy_id' ];

  if ( lastId !== undefined ) {

    fields.push( 'id' );

  }

  const k = knex( config.schemas.agendaEvent )
    .select( fields );

  if (limit !== undefined) {
    k.limit(limit);
  }

  if ( lastId !== undefined ) {
    k.where( 'id', '>', lastId );
  } else {
    k.offset( offset );
  }

  _query( k, query );

  return k.then( rows => rows.map( r => _.mapKeys( r, ( v, k ) => _.camelCase( k ) ) ) );
}

function _query( k, query ) {
  if ( query.agendaUid !== undefined ) {
    k.where( 'agenda_uid', query.agendaUid );
  } else if ( query.userUid !== undefined ) {
    k.where( 'user_uid', query.userUid );
  } else {
    k.where( 'event_uid', query.eventUid );
  }

  if ( query.state !== undefined ) {
    k.andWhere( 'state', query.state );
  }
}
