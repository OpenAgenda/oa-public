"use strict";

const ih = require( 'immutability-helper' );
const Service = require( '@openagenda/members' );
const sessions = require( '@openagenda/sessions' );

const cmn = require( '../../lib/commons-app' );

const streamCsv = require( './lib/streamCsv' );
const streamXlsx = require( './lib/streamXlsx' );
const flatten = require( './lib/flatten' );

const members = {};

const interfaces = {
  getEventCountByUserUid: require( './getEventCountByUserUid' ),
  getUsersByUid: require( './getUsersByUid' ),
  onRemove: require( './onRemove' ).bind( null, members )
}

module.exports = parentApp => {

  parentApp.all( [
    '/:agendaSlug/admin/members.:format',
    '/:agendaSlug/admin/members/:id'
  ], [
    sessions.middleware.ifUnlogged( ( req, res ) => res.status( 403 ).json( {
      message: 'A session must be opened to access this route',
    } ) ),
    cmn.loadAgendaBy( { slug: 'agendaSlug' } ),
    cmn.authorize.moderator
  ] );

  parentApp.get(
    '/:agendaSlug/admin/members.:format',
    ( req, res, next ) => {
      req.order = 'actionsCounter.desc';
      next();
    }
  );

  parentApp.get(
    '/:agendaSlug/admin/members.json',
    async ( req, res, next ) => {

      res.json( await members.list( ih( req.query, {
        agendaUid: { $set: req.agenda.uid }
      } ), Object.assign( {}, req.query, { order: req.order } ), {
        legacy: true,
        detailed: true,
        total: true
      } ) );

    }
  );

  parentApp.get( [
    '/:agendaSlug/admin/members.csv',
    '/:agendaSlug/admin/members.xlsx'
  ], ( req, res, next ) => {

    req.stream = members.stream( ih( req.query, {
      agendaUid: { $set: req.agenda.uid }
    } ), { order: req.order }, {
      detailed: true,
      transform: flatten( req.lang )
    } );

    next();

  } );

  parentApp.delete( '/:agendaSlug/admin/members/:id',
    _loadMember,
    _verifyDeleteCredentials,
    _removeMember
  );

  parentApp.get( '/:agendaSlug/admin/members.csv', streamCsv );
  parentApp.get( '/:agendaSlug/admin/members.xlsx', streamXlsx );

};

module.exports.utils = Service.utils;

module.exports.init = config => {

  Object.assign( members, Service( {
    knex: config.knex,
    schema: 'reviewer',
    interfaces
  } ) );

  Object.assign( module.exports, members );

}

function _removeMember( req, res, next ) {

  members.remove( req.member.id, { context: { user: req.user } } ).then( () => {
    res.status( 200 ).json( { message: 'done.' } );
  }, next );

}

function _loadMember( req, res, next ) {

  members.get( {
    agendaUid: req.agenda.uid,
    id: req.params.id
  } ).then( member => {
    if ( !member ) return next( 'Member not found' );
    req.member = member;
    next();
  }, next );

}

function _verifyDeleteCredentials( req, res, next ) {

  if ( req.role === 'moderator' && req.member.role === 'administrator' ) {
    return res.status( 400 ).json( { error: 'You cannot remove an administrator' } );
  }

  return next();

}
