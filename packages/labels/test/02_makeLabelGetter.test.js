'use strict';

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
    fr: `Vous {numPhotos, plural, =0 {n''} other {}}avez {numPhotos, plural,
      =0 {pas de photos.}
      =1 {une photo.}
      other {# photos.}
    }`
  },
  simpleWithQuote: {
    en: 'Hello world',
    fr: 'Bonjour l\'monde'
  },
  simpleWithEscapedQuote: {
    en: 'Hello world',
    fr: 'Bonjour l\'\'monde'
  }
};

const getLabel = makeLabelGetter( messages, 'en' );

describe( 'makeLabelGetter - functional', () => {

  it( 'simple label', () => {

    expect(getLabel( 'helloWorld', 'fr' )).toBe( 'Bonjour le monde' );

  } );

  it( 'simple label with values', () => {

    expect(getLabel( 'welcome', { name: 'Bertho', age: 23 }, 'fr' )).toBe( 'Bonjour Bertho, tu as 23 ans' );

  } );

  it( 'simple label with quote', () => {

    expect(getLabel( 'simpleWithQuote', { name: 'Bertho', age: 23 }, 'fr' )).toBe( 'Bonjour l\'monde' );

  } );

  it( 'simple label with escaped quote', () => {

    expect(getLabel( 'simpleWithEscapedQuote', { name: 'Bertho', age: 23 }, 'fr' )).toBe( 'Bonjour l\'monde' );

  } );

  it( 'ICU message', () => {

    expect(getLabel( 'yourPhotos', { numPhotos: 0 }, 'fr' )).toBe( 'Vous n\'avez pas de photos.' );
    expect(getLabel( 'yourPhotos', { numPhotos: 1 }, 'fr' )).toBe( 'Vous avez une photo.' );
    expect(getLabel( 'yourPhotos', { numPhotos: 42 }, 'fr' )).toBe( 'Vous avez 42 photos.' );

  } );

  it( 'fallback language', () => {

    expect(getLabel( 'yourPhotos', { numPhotos: 0 }, 'it' )).toBe( 'You have no photos.' );
    expect(getLabel( 'yourPhotos', { numPhotos: 1 }, 'it' )).toBe( 'You have one photo.' );
    expect(getLabel( 'yourPhotos', { numPhotos: 42 }, 'it' )).toBe( 'You have 42 photos.' );

  } );

} );
