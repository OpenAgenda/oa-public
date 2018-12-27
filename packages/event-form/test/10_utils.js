import getMultilingualFieldNames from '../src/utils/getMultilingualFieldNames';
import transferMultilingualValues from '../src/utils/transferMultilingualValues';
import identifyLanguageChanges from '../src/utils/identifyLanguageChanges';
import getTimingsSpan from '../src/utils/getTimingsSpan';


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

  test( 'given a list of timings, returns in ms the time between the first begin time and the last end time', () => {

    const ms = getTimingsSpan( [ {
      begin: '2018-12-24T10:00:00.0002',
      end: '2018-12-24T11:00:00.0002'
    }, {
      begin: '2018-12-31T09:00:00.0002',
      end: '2018-12-31T22:00:00.0002'
    }, {
      begin: '2018-12-24T15:00:00.0002',
      end: '2018-12-24T19:00:00.0002'
    }, {
      begin: '2018-12-25T09:00:00.0002',
      end: '2018-12-25T10:00:00.0002'
    } ] );

    expect( ms / 1000 / 60 / 60 / 24 ).toEqual( 7.5 );

  } );

} );
