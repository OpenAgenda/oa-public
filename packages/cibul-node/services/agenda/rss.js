"use strict";

const src = require( './' ),

  rss = require( 'rss' ),

  eventSvc = require( '../event' ),

  async = require( 'async' ),

  utils = require( 'utils' ),

  config = require( '../../config' );


/**
 * run search events middleware first,
 * then this
 */

module.exports = function( req, res ) {

  let feed = new rss( {
    title: req.agenda.title,
    description: req.agenda.description || req.agenda.title,
    feed_url: req.genUrl( 'agendaRssEvents', { uid: req.agenda.uid }, { abs: true } ),
    site_url: req.genUrl( 'agendaShow', { slug: req.agenda.slug }, { abs: true } ),
    generator: 'OpenAgenda',
    image_url: req.agenda.image ? config.aws.imageBucketPath + req.agenda.image : false,
    language: req.lang,
    pubDate: req.agenda.updatedAt,
    ttl: 120,
    custom_namespaces: {
      'oaevent': 'https://s3.eu-central-1.amazonaws.com/oastatic/dtd/oaevent#'
    },
    custom_elements: [ {
      'oaevent:image': 'Image of the event'
    }, {
      'oaevent:range': 'Time range of the event'
    }, {
      'oaevent:location' : 'Name of the location of the event'
    }, {
      'oaevent:address' : 'Address of the event'
    } ]
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
        description: _buildRssDescription( eInst, exp, req.lang ),
        url: req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: eInst.slug, lang: req.lang }, { abs: true } ),
        guid: req.agenda.uid + '/' + eInst.uid,
        date: eInst.createdAt,
        lat: exp.latitude,
        long: exp.longitude,
        custom_elements: [ {
          'oaevent:image' : exp.image || null
        }, {
          'oaevent:range' : exp.range[ req.lang ]
        }, {
          'oaevent:location' : exp.location.name
        }, {
          'oaevent:address' : exp.location.address
        } ]
      } );

      ecb();

    } );

  }, ( err ) => {

    if ( err ) return next( err );

    res.set( 'Content-Type', 'application/rss+xml' );

    res.send( feed.xml() );

  } );

  

}

function _buildRssDescription( instance, exp, lang ) {

  let longDescription = utils.cleanString( 
    exp.html && exp.html[ lang ] ? exp.html[ lang ] : ''
  );

   return [ 
    '<p>',
      instance.getDescription(),
    '</p>', 
    '<p>',
      exp.range[ lang ],
    '</p>', 
    longDescription
  ].join( '' );    

}