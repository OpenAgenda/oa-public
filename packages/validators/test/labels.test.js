"use strict";

var labels = require( '../src' ).labels;

describe( 'validator labels', () => {

  beforeEach( () => { labels.setLang( 'fr' ) } );

  it( 'returns error label with loaded value in preset language', () => {

    expect(labels.getLabel( 'number.toosmall', { min: 10 } )).toBe('Le nombre doit être supérieur ou égal à 10');

  } );

  it( 'returns error label with loaded value in arg language', () => {

    expect(labels.getLabel( 'number.toosmall', { min: 10 }, 'en' )).toBe('The number must be equal to or higher than 10');

  } );

} );