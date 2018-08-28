"use strict";

const getMultilingualFieldNames = require( '../src/utils/getMultilingualFieldNames' );
const transferMultilingualValues = require( '../src/utils/transferMultilingualValues' );
const identifyLanguageChanges = require( '../src/utils/identifyLanguageChanges' );

describe( 'event-form utils unit tests', () => {

  test( 'getMultilingualFieldNames', () => {

    expect( getMultilingualFieldNames( {
      fields: [ {
        field: 'notmulti'
      }, {
        field: 'multi',
        languages: []
      } ]
    } ) ).toEqual( [ 'multi' ] );

  } );

  test( 'transferMultilingualValues - transfering language values', () => {

    expect( transferMultilingualValues( {
      notmulti: 'A value',
      multi: {
        fr: 'Une valeur multilingue'
      },
      multi_2: {
        fr: 'Une autre valeur'
      }
    }, [ 'multi', 'multi_2' ], 'fr', 'is' ) ).toEqual( {
      notmulti: 'A value',
      multi: {
        is: 'Une valeur multilingue'
      },
      multi_2: {
        is: 'Une autre valeur'
      }
    } );

  } );

  test( 'identifyLanguageChanges - changing a language', () => {

    expect( identifyLanguageChanges( [ 'fr' ], [ 'es' ] ) ).toEqual( {
      addedLanguages: [ 'es' ],
      removedLanguages: [ 'fr' ],
      changedLanguages: [ 'es' ]
    } );

  } );

} );
