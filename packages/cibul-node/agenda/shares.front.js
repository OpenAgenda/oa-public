"use strict";

const config = require( '../config' );
const shares = require( '@openagenda/shares' )( config.shares.agenda );
const agendaSvc = require( '../services/agenda' );
const embedSvc = require( '../services/embed' );


module.exports = app => {

  app.get(
    '/:slug/share/:service',
    agendaSvc.mw.load( 'slug' ),
    share
  );

  app.get(
    '/agendas/:uid/embed/share/:service',
    agendaSvc.mw.load( 'uid' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    share
  );

};


function share( req, res, next ) {

  if ( !shares.has( req.params.service ) ) {

    return next( { code: 404, message: 'This share type does not exist' } );

  }

  req.log( 'info', { message: 'sharing agenda', uid: req.agenda.uid, slug: req.agenda.slug, service: req.params.service } );

  res.redirect( shares.getLink( req.params.service, {
    title: req.agenda.title,
    description: req.agenda.description ,
    url: req.embed ?
      req.genUrl( 'customEmbedShow', { uid: req.agenda.uid, embedUid: req.embed.uid }, { abs: true, protocol: 'https://' } )
      : req.genUrl( 'agendaShow', { slug: req.agenda.slug }, { abs: true, protocol: 'https://' } ),
    siteUrl: config.root
  } ) );

}
