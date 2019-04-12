"use strict";

const should = require( 'should' );
const layouts = require( '../' );

describe( 'utils - layout', () => {

  it( 'main layout contains title tag', () => {

    const result = layouts.main( '<p>grut</p>', {
      lang: 'fr',
      title: 'A title'
    } );

    result.indexOf( '<title>A title</title>' ).should.not.equal( -1 );

  } );

  it( 'main layout contains given html content', () => {

    const htmlContent = '<p>grut</p>';

    const result = layouts.main( htmlContent, {
      lang: 'fr',
      title: 'A title'
    } );

    result.indexOf( htmlContent ).should.not.equal( -1 );

  } );

  it( 'agenda layout contains agenda title', () => {

    const result = layouts.agenda( '<p>grut</p>', {
      lang: 'fr',
      agenda: {
        title: 'Culture Châtellerault'
      }
    } );

    result.indexOf( '<title>Culture Châtellerault</title>' );

  } );

} );
