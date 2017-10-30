"use strict";

const _ = require( 'lodash' );
const rss = require( 'flat-exports/rss' );
const search = require( '../../services/eventSearch' );
const config = require( '../../config' );

module.exports = ( app, route ) => {

  app.get( route, async ( req, res, next ) => {

    let feed;

    try {

      const query = _.extend( { sort: 'updatedAt.desc' }, req.query );

      const { events, total } = await search.agendas( req.params.agendaUid ).search( req.query, req.query, { detailed: true } );
      
      feed = rss( {
        title: req.agenda.title,
        description: req.agenda.description,
        feedURL: config.root + req.originalUrl,
        siteURL: config.root,
        imageURL: req.agenda.image ? config.aws.imageBucketPath + req.agenda.image : null,
        language: req.lang,
        pubDate: req.agenda.updatedAt
      } );

      events.forEach( e => feed.addEvent( e ) );

    } catch ( err ) {

      return next( err );

    }

    res.set( 'Content-Type', 'application/rss+xml' );

    res.send( feed.xml() );

  } );

}