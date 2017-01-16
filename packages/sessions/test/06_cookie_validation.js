"use strict";

const should = require( 'should' );
const validate = require( '../iso/cookie.validate.js' );

describe( 'session - unit (iso): cookie data validate', () => {

  it( 'cookie validate describes and cleans data kept in session cookie', () => {

    let cookieData = {
      flash: 'Taanaaa Savioroftheuniverse! Pom pom pom pom.',
      user: {
        name: 'Gaetan Latouche',
        culture: 'fr',
        uid: 12345678,
        thumbnail: '//graph.facebook.com/100002280111541/picture'
      }
    };

    validate( cookieData ).should.eql( cookieData );

  } );

} );
