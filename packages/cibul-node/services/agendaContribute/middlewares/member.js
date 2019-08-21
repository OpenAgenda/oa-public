"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/middlewares/member' );

const members = require( '../../members' );

module.exports = function( req, res, next ) {
  log( 'getting member for user %s in agenda %s', _.get( req, 'user.uid' ), _.get( req, 'agenda.uid' ) );

  const userUid = _.get( req, 'user.uid' );
  const agendaUid = _.get( req, 'agenda.uid' );

  if ( !userUid ) return next( 403 );
  if ( !agendaUid ) return next( 404 );

  members.get( { agendaUid, userUid } ).then( member => {
    req.member = member ? { ..._.get( member, 'custom' ),
      role: members.utils.getRoleSlug( member.role )
    } : null;
    next();
  }, next );
}
