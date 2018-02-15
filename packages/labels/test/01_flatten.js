"use strict";

const should = require( 'should' );
const flatten = require( '../flatten' );

describe( 'flatten - functional', () => {

  it( 'flatten labels object to reduce it to a single language', () => {

    flatten( {
      label1: { fr: 'Label Un', en: 'Label One' },
      label2: { fr: 'Label Deux', en: 'Label Two' }
    }, 'fr' ).should.eql( {
      label1: 'Label Un',
      label2: 'Label Deux' 
    } );

  } );

  it( 'flatten does not pick fallback labels by default', () => {

    flatten( {
      label1: { en: 'Label One' },
      label2: { fr: 'Label Deux', en: 'Label Two' }
    }, 'fr' ).should.eql( {
      label1: undefined,
      label2: 'Label Deux'
    } );

  } );

  it( 'flatten picks fallback if option is set to true', () => {

    flatten( {
      label1: { en: 'Label One' },
      label2: { fr: 'Label Deux', en: 'Label Two' }
    }, 'fr', true ).should.eql( {
      label1: 'Label One',
      label2: 'Label Deux'
    } );

  } );

} );
