"use strict";

const should = require( 'should' );
const parseMarkdown = require( '../service/lib/parseMarkdown' );

describe( 'events - unit (iso): parseMarkdown', () => {

  it( 'parses markdown to give html', () => {

    parseMarkdown( '**Simply the best**' )

      .should.equal( '<p><strong>Simply the best</strong></p>\n' );

  } );

} );