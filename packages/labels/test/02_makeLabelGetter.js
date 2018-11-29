'use strict';

const should = require( 'should' );
const makeLabelGetter = require( '../makeLabelGetter' );

const messages = {
  helloWorld: {
    en: 'Hello world',
    fr: 'Bonjour le monde'
  },
  welcome: {
    en: 'Hi %name%, you have %age%',
    fr: 'Bonjour %name%, tu as %age% ans'
  },
  yourPhotos: {
    en: `You have {numPhotos, plural,
      =0 {no photos.}
      =1 {one photo.}
      other {# photos.}
    }`,
    fr: `Vous {numPhotos, plural, =0 {n'} other {}}avez {numPhotos, plural,
      =0 {pas de photos.}
      =1 {une photo.}
      other {# photos.}
    }`
  }
};

const getLabel = makeLabelGetter( messages, 'en' );

describe( 'makeLabelGetter - functional', () => {

  it( 'simple label', () => {

    getLabel( 'helloWorld', 'fr' ).should.equal( 'Bonjour le monde' );

  } );

  it( 'simple label with values', () => {

    getLabel( 'welcome', { name: 'Bertho', age: 23 }, 'fr' ).should.equal( 'Bonjour Bertho, tu as 23 ans' );

  } );

  it( 'ICU message', () => {

    getLabel( 'yourPhotos', { numPhotos: 0 }, 'fr' ).should.equal( 'Vous n\'avez pas de photos.' );
    getLabel( 'yourPhotos', { numPhotos: 1 }, 'fr' ).should.equal( 'Vous avez une photo.' );
    getLabel( 'yourPhotos', { numPhotos: 42 }, 'fr' ).should.equal( 'Vous avez 42 photos.' );

  } );

  it( 'fallback language', () => {

    getLabel( 'yourPhotos', { numPhotos: 0 }, 'it' ).should.equal( 'You have no photos.' );
    getLabel( 'yourPhotos', { numPhotos: 1 }, 'it' ).should.equal( 'You have one photo.' );
    getLabel( 'yourPhotos', { numPhotos: 42 }, 'it' ).should.equal( 'You have 42 photos.' );

  } );

} );
