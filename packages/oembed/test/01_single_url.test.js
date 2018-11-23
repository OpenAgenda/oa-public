"use strict";

const _ = require( 'lodash' );

const options = require( '../testconfig' );

const OEmbed = require( '../src' );

const urls = {
  calameo: [
    'http://fr.calameo.com/read/00096250654676c5c42f2'
  ]
}

describe( 'parsing urls', () => {

  const oe = new OEmbed( options );

  test( 'gets calameo', async () => {

    const result = await oe.get( urls.calameo[ 0 ] );

    expect( _.keys( result ) ).toEqual( [
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
    ] );

  } );

} );
