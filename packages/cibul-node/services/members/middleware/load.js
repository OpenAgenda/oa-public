"use strict";

const getLabel = require('@openagenda/labels/makeLabelGetter')(
  require('@openagenda/labels/members')
);
const {
  isSuperiorToOrEqual
} = require( '@openagenda/members' ).utils.compareRoles;
const log = require( '@openagenda/logs' )( 'services/members/middleware/loadMember' );

const sessions = require('../../sessions');

module.exports = ( members, req, res, next ) => {
  log( 'loading current user member reference' );
  _load( members, req ).then( next, next );
}

module.exports.loadAndAuthorize = (members, requiredRole) => {
  return (req, res, next) => {
    log( 'load and authorize', requiredRole );
    _load(members, req).then(() => {
      if (req.member && isSuperiorToOrEqual(req.member.role, requiredRole)) {
        next();
      } else if (!req.member) {
        sessions.setFlash(req, res, getLabel('memberRequired', req.lang))
        res.redirect(302, `/${req.agenda.slug}`);
      } else {
        sessions.setFlash(req, res, getLabel('roleInsufficient', req.lang))
        res.redirect(302, `/${req.agenda.slug}`);
      }
    });
  }
}

module.exports.loadOrFail = ( members, req, res, next ) => {
  log( 'loading current user member reference... or fail' );
  _load( members, req ).then( () => {
    if ( !req.member ) {
      res.setStatus( 403 );
      return next( 'Not a member' );
    }
    next();
  } );
}

function _load( members, req ) {
  return members.get( {
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  } ).then( member => {
    req.member = member;
  } );
}
