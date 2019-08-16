"use strict";

const _ = require( 'lodash' );
const agendaEvents = require( '@openagenda/agenda-events' );
const getLabel = require( '@openagenda/labels/makeLabelGetter' )(
  require( '@openagenda/labels/agenda-contribute/authorization' )
);
const {
  isSuperiorTo
} = require( '@openagenda/members' ).utils.compareRoles;
const types = require( '@openagenda/agendas/service/validate/contributionTypes' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/middlewares/verifyMemberAuthorization' );

module.exports = ( req, res, next ) => {
  const agendaContributionType = _.get( req, 'agenda.settings.contribution.type', 0 );

  if ( agendaContributionType === types.CLOSED ) {
    return next( {
      code: 403,
      message: getLabel( 'noAccessToClosedAgenda', req.lang )
    } );
  } else if ( agendaContributionType === types.MEMBERS_ONLY ) {
    if ( !req.member ) {
      return res.redirect( 302, `/${req.agenda.slug}/request-contribute/conversation/create` );
    }
  }

  next();
}


module.exports.edit = ( req, res, next ) => {
  if ( req.event.draft ) {
    return _draft( req, res, next );
  }

  agendaEvents( req.agenda.uid ).get( req.event.uid ).then( ae => {

    if ( !ae ) return next( {
      code: 404,
      message: getLabel( 'eventNotLinkedToAgenda', req.lang )
    } );

    if ( isSuperiorTo( req.member.role, 'contributor' ) ) {
      return next();
    }

    if ( ae.userUid === req.user.uid ) {
      return next();
    }

    return next( {
      code: 403,
      message: getLabel( 'noAccessToEdit', req.lang )
    } );
  }, next );
}

function _draft( req, res, next ) {
  log( 'event is draft' );

  if ( req.user.uid !== req.event.creatorUid ) {
    return next( {
      code: 403,
      message: getLabel( 'noAccessToDraft', req.lang )
    } );
  }

  return next();
}
