"use strict";

const cmn = require( '../lib/commons-app' );
const agendaSvc = require( '../services/agenda' );


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
