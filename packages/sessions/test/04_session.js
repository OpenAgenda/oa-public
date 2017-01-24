"use strict";

const config = require( '../testconfig' );
const sessions = require( '../' );
const isoConfig = require( '../iso/config' );
const clientSession = require( '../client' );
const should = require( 'should' );
const jsdom = require( 'jsdom' );
const base64 = require( 'utils/base64' );
const cookiesLib = require( 'cookies-js' );

describe( 'session - functional (client): session', () => {

  describe( '.getUser', () => {

    it( 'returns user data if logged', done => {

      jsdom.env( '<a>hidung</a>', ( err, w ) => {

        let c = cookiesLib( w );

        clientSession.test.loadCookiesLib( c );

        c.set( isoConfig.cookies.session, base64.encode( JSON.stringify( { user: { uid: 123, name: 'tony', culture: 'en' } } ) ) );

        clientSession.getUser().should.eql( {
          uid: 123,
          name: 'tony',
          culture: 'en',
          thumbnail: undefined
        } );

        done();

      } );

    } );

    it( 'returns null when not logged', done => {

      jsdom.env( '<a>hidung</a>', ( err, w ) => {

        let c = cookiesLib( w );

        clientSession.test.loadCookiesLib( c );

        should( clientSession.getUser() ).equal( null );

        done();

      } );

    } );

  } )

  describe( '.isLogged', () => {

    it( 'returns true if user is logged', done => {

      jsdom.env( '<a>goudale</a>', ( err, w ) => {

        let c = cookiesLib( w );

        clientSession.test.loadCookiesLib( cookiesLib( w ) );

        c.set( isoConfig.cookies.session, base64.encode( JSON.stringify( { user: { uid: 123, name: 'tony', culture: 'en' } } ) ) );

        clientSession.isLogged().should.equal( true );

        done();

      } );

    } );

    it( '... and false if not', done => {

      jsdom.env( '<a>hidung</a>', ( err, w ) => {

        let c = cookiesLib( w );

        clientSession.test.loadCookiesLib( cookiesLib( w ) );

        clientSession.isLogged().should.equal( false );

        done();

      } );

    } );

  } );

  describe( '.flash', () => {

    it( 'returns null if no flash message is defined', done => {

      jsdom.env( '<a>kaore</a>', ( err, w ) => {

        // necessary for initializing cookies lib in test
        // environment - see cookies-js documentation
        clientSession.test.loadCookiesLib( cookiesLib( w ) );

        should( clientSession.flash() ).equal( null );

        done();

      } );

    } );

    it( 'if a flash is set, returns the flash value', done => {

      jsdom.env( '<a>botol</a>', ( err, w ) => {

        let c = cookiesLib( w );

        clientSession.test.loadCookiesLib( c );

        c.set( isoConfig.cookies.writable, base64.encode( JSON.stringify( { flash: 'grut' } ) ) );

        clientSession.flash().should.equal( 'grut' );

        done();

      } )

    } );

    it( 'if a flash is set, clears the value after call', done => {

      jsdom.env( '<a>sendok</a>', ( err, w ) => {

        let c = cookiesLib( w );

        clientSession.test.loadCookiesLib( c );

        c.set( isoConfig.cookies.writable, base64.encode( JSON.stringify( { flash: 'grut' } ) ) );

        clientSession.flash();

        should( clientSession.flash() ).equal( null );

        done();

      } );

    } );

  } );

} );