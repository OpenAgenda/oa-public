"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/middlewares/member' );
const members = require( '@openagenda/agenda-stakeholders' );

const memberMap = require( '../lib/stakeholder.map' );

module.exports = function( req, res, next ) {

  log( 'getting member for user %s in agenda %s', _.get( req, 'user.uid' ), _.get( req, 'agenda.uid' ) );

  const userId = _.get( req, 'user.id' );
  const agendaId = _.get( req, 'agenda.id' );

  if ( !userId ) return next( 403 );

  if ( !agendaId ) return next( 404 );

  members.agenda( agendaId ).get( { userId }, ( err, stakeholder ) => {

    if ( err ) return next( err );

    if ( !stakeholder ) return next();

    req.member = memberMap.toMember( stakeholder.custom );

    log( 'loaded member %j', req.member );

    next();

  } );

}
