"use strict";

const validator = require( 'validator' );
const sessions = require( '@openagenda/sessions' );
const usersSvc = require( '@openagenda/users' );
const stakeholdersMw = require( '@openagenda/agenda-stakeholders/dist/middleware' );
const getActionLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/agendas/actions' ) );
const cmn = require( '../lib/commons-app' );
const agendaSvc = require( '../services/agenda' );
const eventSvc = require( '../services/event' );


module.exports = app => {

  app.get(
    '/:slug/admin/contributors/info',
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oasfmain.css' ),
    info
  );

  app.post(
    '/:slug/admin/contributors/info',
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData(),
    infoSubmit
  );

};


function info( req, res ) {

  req.agenda.getContributionInfo( ( err, info ) => {

    cmn.render( req, res, 'contributors/info', {
      info
    } );

  } );

}


function infoSubmit( req, res ) {

  req.agenda.setContributionInfo( req.body.info, true, function ( err ) {

    if ( err ) return next( err );

    res.redirect( req.genUrl( 'contributorsInfo', { slug: req.agenda.slug } ) );

  } );

}
