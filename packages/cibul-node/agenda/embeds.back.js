"use strict";

const cmn = require( '../lib/commons-app' );
const agendaSvc = require( '../services/agenda' );
const embedSvc = require( '../services/embed' );
const members = require( '../services/members' );
const model = require( '../services/model' );

module.exports = app => {

  app.get(
    '/:slug/admin/embeds/:embedUid/switch',
    agendaSvc.mw.load( 'slug' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    members.mw.loadAndAuthorize('administrator'),
    switchToV2
  );

};


function switchToV2( req, res, next ) {

  // bit ugly but temporary.

  model.lib.update( 'reviewEmbeds', { uid: req.embed.uid }, { version: 2 }, function( err, result ) {

    if ( err ) return next( err );

    req.log( 'info', {
      action: 'switchToV2',
      embedId: req.embed.id,
      agendaSlug: req.agenda.slug
    } );

    res.redirect( 302, `/${req.agenda.slug}/admin/webembed` );

  });

}
