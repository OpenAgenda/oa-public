"use strict";

const expressCookie = require( '../service/expressCookie' );
const should = require( 'should' );
const config = require( '../testconfig' );
const base64 = require( 'utils/base64' );

describe( 'session - unit (server): express cookies', () => {

  let req = {}, res = {};

  beforeEach( () => expressCookie.init( config ) );

  it( 'expressCookie get gets values of a cookie in an express request', () => {

    let ec = expressCookie( 'grut', /* request obj */ {
      cookies: {
        grut: base64.encode( JSON.stringify( { the: 'content' } ) )
      }
    } );

    ec.get().should.eql( { the: 'content' } );

  } );

  it( 'expressCookie set sets a given named value in express request and response', () => {

    let responseCookie = {};

    let ec = expressCookie( 'grut', 
      /* request obj */ {
        cookies: {
          grut: base64.encode( JSON.stringify( { the: 'content' } ) )
        }
      },
      /* response obj */ {
        cookie: ( name, values, options ) => responseCookie[ name ] = values
      } );

    ec.set( 'is', 'updated' );

    responseCookie.grut.should.equal( base64.encode( JSON.stringify( { the: 'content', is: 'updated' } ) ) );

  } );

  it( 'expressCookie clear removes all values from cookie', () => {

    let responseCookie = {};

    let ec = expressCookie( 'grut', 
      /* request obj */ {
        cookies: {
          grut: base64.encode( JSON.stringify( { the: 'content' } ) )
        }
      },
      /* response obj */ {
        cookie: ( name, values, options ) => responseCookie[ name ] = values
      } );

    ec.clear();

    responseCookie.grut.should.equal( base64.encode( JSON.stringify( {} ) ) );

  } );

} ); 