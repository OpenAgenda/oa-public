"use strict";

const should = require( 'should' );
const config = require( '../testconfig' );

const extParse = require( '../service/extensions/parse' );

describe( 'event-search - unit: extensions', function() {

  it( 'parser converts validator schemas to mappings', () => {

    extParse( {
      captainAge: {
        type: 'integer'
      },
      expectedWeather: {
        type: 'text'
      },
      captainEmail: {
        type: 'email'
      }
    } )

    .should.eql( { 
      properties: { 
        captainAge: { type: 'integer' },
        expectedWeather: { type: 'text' },
        captainEmail: { type: 'keyword' },
        search_internal_keywords: { type: 'keyword' }
      } 
    } );

  } );

} );