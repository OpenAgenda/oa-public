"use strict";

const rss = require( 'rss' );
const _ = require( 'lodash' );
const formatEvent = require( './lib/rss/formatEvent' );
const validateHead = require( './lib/rss/validateHead' );

module.exports = head => {

  const feed = new rss( _.mapKeys( validateHead( head ), ( v, k ) => ( {
    title: 'title',
    description: 'description',
    feedURL: 'feed_url',
    siteURL: 'site_url',
    generator: 'generator',
    imageURL: 'image_url',
    language: 'language',
    pubDate: 'pubDate',
    custom_namespaces: 'custom_namespaces'
  }[ k ] ) ) );

  return {
    addEvent: event => feed.item( formatEvent( event, { lang: head.language } ) ),
    xml: feed.xml.bind( feed )
  }

}