"use strict";

var src = require( './' ),

rss = require( 'rss' ),

eventSvc = require( '../event' ),

async = require( 'async' ),

config = require( '../../config' );


/**
 * run search events middleware first,
 * then this
 */

module.exports = function( req, res ) {

  var feed = new rss( {
    title: req.agenda.title,
    description: req.agenda.description || req.agenda.title,
    feed_url: req.genUrl( 'agendaRssEvents', { slug: req.agenda.slug }, { abs: true } ),
    site_url: req.genUrl( 'agendaShow', { slug: req.agenda.slug }, { abs: true } ),
    generator: 'OpenAgenda',
    image_url: req.agenda.image ? config.aws.imageBucketPath + req.agenda.image : false,
    language: req.lang,
    pubDate: req.agenda.updatedAt,
    ttl: 120
  } );

  async.eachSeries( req.events.map( eventSvc.instanciate ), ( eInst, ecb ) => {

    eInst.exportable( ( err, exp ) => {

      if ( err ) {

        req.log( 'error', err );

        return ecb();

      }

      eInst.switchLanguage( req.lang );

      feed.item( {
        title: eInst.getTitle(),
        description: '<p>' + eInst.getDescription() + '</p><p> ' + exp.range[ req.lang ] + '</p>' + ( exp.html[ req.lang ] || '' ) ,
        url: req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: eInst.slug, lang: req.lang }, { abs: true } ),
        guid: req.agenda.uid + '/' + eInst.uid,
        date: eInst.createdAt,
        lat: exp.latitude,
        long: exp.longitude
      } );

      ecb();

    } );

  }, ( err ) => {

    if ( err ) return next( err );

    res.set( 'Content-Type', 'application/rss+xml' );

    res.send( feed.xml() );

  } );

  

}