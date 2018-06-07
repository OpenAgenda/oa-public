"use strict";

const should = require( 'should' );
const formatEvent = require( '../lib/rss/formatEvent' );
const rss = require( '../rss' );
const event = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/fixtures/sortir-a-boulogne-billancourt.json', 'utf-8' ) );

describe( 'flat-exports - unit - rss', () => {

  test( 'formatEvent', () => {

    formatEvent( event ).custom_elements.should.eql( [
      { 'ev:startdate': '2017-03-08T09:30:00' },
      { 'ev:enddate': '2017-12-21T18:00:00' },
      { 'ev:location': 'Centre national du Jeu - 17, allée Robert Doisneau, 92100 Boulogne-Billancourt' }
    ] );

  } );

  test( 'formatEvent - custom genUrl', () => {

    formatEvent( event, { genUrl: e => 'grut' + e.uid } ).url.should.equal( 'grut' + event.uid );

  } );

} );


describe( 'flat-exports - functional - rss', () => {

  let xml;

  beforeAll( () => {

    const feed = rss( {
      title: 'Un agenda',
      description: 'Un agenda de test',
      feedURL: 'https://openagenda.com',
      siteURL: 'https://openagenda.com',
      language: 'fr'
    } );

    feed.addEvent( event );

    xml = feed.xml();

  } );

  it( 'rss head should contain xmlns:ev reference', () => {

    xml.indexOf( 'xmlns:ev' ).should.not.equal( -1 );

  } );

  it( 'links in enclosures should be http', () => {

    xml.indexOf( 'enclosure url="https' ).should.equal( -1 );

    xml.indexOf( 'enclosure url="http' ).should.not.equal( -1 );

  } );

} );