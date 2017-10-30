"use strict";

var should = require( 'should' ),

labels = require( '../src' ).labels;

describe( 'validator labels', () => {

  beforeEach( () => { labels.setLang( 'fr' ) } );

  it( 'returns error label with loaded value in preset language', () => {

    labels.getLabel( 'number.toosmall', { min: 10 } )

    .should.equal( 'Le nombre doit être supérieur ou égal à 10' );

  } );

  it( 'returns error label with loaded value in arg language', () => {

    labels.getLabel( 'number.toosmall', { min: 10 }, 'en' )

    .should.equal( 'The number must be equal to or higher than 10' );

  } );

} );