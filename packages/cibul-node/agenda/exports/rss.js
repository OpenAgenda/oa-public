"use strict";

const _ = require( 'lodash' );
const rss = require( '@openagenda/flat-exports/rss' );
const config = require( '../../config' );

module.exports = ( app, route ) => {

  app.get( route, async ( req, res, next ) => {

    let feed;

    try {

      const query = _.extend( {
        sort: 'updatedAt.desc',
        embed_url: null
      }, req.query );

      const { events, total } = await app.services.eventSearch.agendas( req.params.agendaUid ).search( req.query, req.query, { detailed: true } );

      const rssOptions = {
        title: req.agenda.title,
        description: req.agenda.description,
        feedURL: config.root + req.originalUrl,
        siteURL: config.root,
        imageURL: req.agenda.image ? config.aws.imageBucketPath + req.agenda.image : null,
        language: req.lang,
        pubDate: req.agenda.updatedAt
      };

      if ( query.embed_url ) {

        rssOptions.genUrl = e => query.embed_url + '?oaq[uid]=' + e.uid;

      }

      feed = rss( rssOptions );

      events.forEach( e => feed.addEvent( e ) );

    } catch ( err ) {

      return next( err );

    }

    res.set( 'Content-Type', 'application/rss+xml' );

    res.send( feed.xml() );

  } );

}
