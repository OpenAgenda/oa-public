"use strict";

const should = require( 'should' );

const _distributeByLanguage = require( '../service/helpers/dsl/_distributeByLanguage' );
const derelativize = require( '../service/helpers/derelativize' );

describe( 'event-search - unit: miscellaneous helper testing', function() {

  it( 'derelativize - converts relative term with absolute', () => {

    const query = derelativize( {
      date: {
        gte: 'today',
        timezone: 'Europe/Paris'
      }
    } );

  } );

  it( '_distributeByLanguage - given predefined fields, distributes object over array of languaged objects', () => {

    /**
     * The mlt search takes in a partial document as a base for a search.
     * It can take several likeness items to get similar content which we
     * use to distribute the partial element criterias over several languages
     */

    const obj = {
      title: {
        fr: 'Ceci est un titre',
        en: 'This is a title'
      },
      description: {
        fr: 'Ceci est une description',
        en: 'This is a description'
      },
      keywords: {
        en: [ 'these', 'are', 'keywords' ]
      },
      uid: 1234
    };

    const byLang = _distributeByLanguage( [ 'title', 'description', 'keywords' ], obj );

    byLang.should.eql( [ [ 'fr', { 
      title: 'Ceci est un titre',
      description: 'Ceci est une description',
      uid: 1234 
    } ], [ 
      'en', { 
        title: 'This is a title',
        description: 'This is a description',
        keywords: [ 'these', 'are', 'keywords' ],
        uid: 1234 
      } ] 
    ] );

  } );

} );