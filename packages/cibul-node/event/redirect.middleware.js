"use strict";

const _ = require( 'lodash' );
const { NotFound } = require('@openagenda/verror');
const unserialize = require( 'locutus/php/var/unserialize' );

const redirectTemplate = _.template( require( 'fs' ).readFileSync( __dirname + '/redirect.tpl', 'utf-8' ) );

module.exports = config => {

  return {
    loadEvent: loadEvent.bind( null, config ),
    loadSiteURL: loadSiteURL.bind(null, config),
    loadFacebookMetas: loadFacebookMetas.bind( null, config ),
    render: render.bind( null, config )
  }

}


function render( config, req, res ) {

  res.send( redirectTemplate( {
    metas: req.metas,
    agenda: req.agenda,
    event: req.event,
    redirect: req.redirect
  } ) );

}


function loadFacebookMetas( config, req, res, next ) {

  req.redirect = req.siteURL ? req.siteURL + '?oaq[uid][]=' + req.event.uid : `/${req.agenda.slug}/events/${req.event.slug}`;

  req.metas = [ {
    property: 'og:title', content: _.escape( req.event.title )
  }, {
    property: 'og:description', content: _.escape( req.event.description )
  }, {
    property: 'og:locale', content: req.lang
  }, {
    property: 'og:url', content: config.root + `/agendas/${req.params.agendaUid}/events/${req.params.eventUid}/share`
  } ];

  if ( _.get( req, 'event.image.filename' ) ) {

    req.metas.push( {
      property: 'og:image',
      content: _.get( req, 'event.image.base' ).replace( 'cibuldev', 'cibul' ) + _.get( req, 'event.image.filename' )
    } );

  }

  next();

}


function loadEvent(config, req, res, next) {
  req.app.services.core.agendas(req.params.agendaUid)
    .events.get(req.params.eventUid, {
      lang: req.lang,
      internal: true,
      returnPayload: true
    }).then(({ event, agenda } = {}) => {
      if (!event) {
        return next(new NotFound());
      }

      req.agenda = agenda;
      req.event = event;

      next();
    }, err => {
      req.log.error(err);

      next({
        code: _.get(err, 'message').indexOf('not found') === -1 ? 500 : 404
      });
    });
}

function loadSiteURL( config, req, res, next ) {

  config.knex( 'review_embed' ).first( [ 'uid', 'store' ] ).where( 'review_id', req.agenda.id ).then( embed => {

    if ( !embed ) return next();

    try {

      req.siteURL = _.get( unserialize( embed.store ), 'siteurl' );

    } catch( e ) {

      req.log.error( 'could not extract siteurl from store of embed %s', embed.uid );

    }

    if ( !req.siteURL & req.agenda.url ) {

      req.siteURL = req.agenda.url;

    }

    next();

  } );

}
