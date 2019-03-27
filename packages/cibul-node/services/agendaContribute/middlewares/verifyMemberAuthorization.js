"use strict";

const _ = require( 'lodash' );
const types = require( '@openagenda/agendas/service/validate/contributionTypes' );
const getLabel = require( '@openagenda/labels/makeLabelGetter' )( require( '@openagenda/labels/agenda-contribute/authorization' ) );

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
