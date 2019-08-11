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
  if ( isSuperiorTo( req.role, 'contributor' ) ) {
    return next();
  }

  agendaEvents( req.agenda.uid ).get( req.event.uid ).then( ae => {
    if ( ae.userUid === req.user.uid ) {
      return next();
    }
    return next( {
      code: 403,
      message: getLabel( 'noAccessToEdit', req.lang )
    } );
  }, next );
}
