"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );

const options = require( '../testconfig' );

const OEmbed = require( '../src' );

const IFRAMELY_OBJECT_KEYS = [
  'url',
  'type',
  'version',
  'title',
  'author',
  'author_url',
  'provider_name',
  'description',
  'thumbnail_url',
  'thumbnail_width',
  'thumbnail_height',
  'html',
  'cache_age'
];

const texts = {
  raffut: fs.readFileSync( __dirname + '/fixtures/forroraffut.md', 'utf-8' ),
  contrebrassens: fs.readFileSync( __dirname + '/fixtures/contrebrassens.txt', 'utf-8' )
}

describe( 'parsing links from markdown', () => {

  const oe = new OEmbed( options );

  test( 'finds links in markdown and returns list of links with oembeds', async () => {

    const result = await oe.fromMarkdown( texts.raffut );

    expect( _.get( result, '0.data.provider_name' ) ).toEqual( 'YouTube' );

    expect( _.keys( result[ 0 ].data ) ).toEqual( IFRAMELY_OBJECT_KEYS );

  } );


  test( 'multiple links in the same text are all processed', async () => {

    const result = await oe.fromMarkdown( texts.contrebrassens );

    expect( result.map( r => _.get( r, 'data.title' ) ).sort() ).toEqual( [
      'CONTREBRASSENS',
      'L\'improbable duo : Contrebrassens & Michael Wookey /// teaser 2016'
    ] );

  } );

  test( 'data that are already in hand can be passed to the function to avoid an unnecessary re-fetch', async () => {

    const result = await oe.fromMarkdown( texts.contrebrassens, {
      current: [ {
        link: 'https://vimeo.com/258230134',
        data: { title: 'This is in hand' }
      } ]
    } );

    expect( result.map( r => _.get( r, 'data.title' ) ).sort() ).toEqual( [
      'L\'improbable duo : Contrebrassens & Michael Wookey /// teaser 2016',
      'This is in hand'
    ] );

  } );


  test( 'can be used as a service', async () => {

    OEmbed.init( { options } );

    const result = await OEmbed.fromMarkdown( texts.raffut );

    expect( result[ 0 ].data.provider_name ).toEqual( 'YouTube' );

  } );

} );
