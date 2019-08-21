"use strict";

const stakeholdersMw = require( '@openagenda/agenda-stakeholders/dist/middleware' );
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

  app.get(
    '/:slug/admin/contributors/:uid.json',
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdminOrModerator,
    _loadUserByUid,
    stakeholdersMw.agenda().get( { user: 'queriedUser' } ),
    ( req, res ) => {
      if ( !req.stakeholder ) {
        res.status( 404 ).send( 'Not found' );
      } else {
        res.json( { name: req.queriedUser.fullName } );
      }
    }
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

async function _loadUserByUid( req, res, next ) {

  try {

    const usersSvc = req.app.service( '/users' );

    req.queriedUser = await usersSvc.get( req.params.uid );

    next();

  } catch ( err ) {

    return next( err );

  }

}
