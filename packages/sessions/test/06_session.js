"use strict";

const should = require( 'should' );
const jsdom = require( 'jsdom' );
const cookiesLib = require( 'cookies-js' );
const base64 = require( '@openagenda/utils/base64' );
const config = require( '../testconfig' );
const sessions = require( '../src/service' );
const isoConfig = require( '../src/iso/config' );
const clientSession = require( '../src/client' );

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

  describe( '.isLogged', function() {

    this.timeout( 30000 );

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


  describe( '.inbox', () => {

    it( 'getSummary - returns times at zero by default', done => {

      jsdom.env( '<a>t\'avais pas fini de réfléchir en fait</a>', ( err, w ) => {

        // this is for test env only
        clientSession.test.loadCookiesLib( cookiesLib( w ) );

        clientSession.inbox.getSummary().should.eql( {
          lastRequestTime: 0,
          lastKnownState: false
        } );

        done();

      } );

    } );

    it( 'getSummary - returns set times if any', done => {

      jsdom.env( '<a>t\'avais pas fini de réfléchir en fait</a>', ( err, w ) => {

        // this is for test env only
        clientSession.test.loadCookiesLib( cookiesLib( w ) );

        clientSession.inbox.setSummary( {
          lastRequestTime: 1000,
          lastKnownState: true
        } );

        clientSession.inbox.getSummary().should.eql( {
          lastRequestTime: 1000,
          lastKnownState: true
        } );

        done();

      } );

    } );

  } );


  describe( '.notifications', () => {

    it( 'returns null if nothing is set', done => {

      jsdom.env( '<a>kaore ouaich</a>', ( err, w ) => {

        // this is for test env only
        clientSession.test.loadCookiesLib( cookiesLib( w ) );

        should( clientSession.notifications.getCount() ).equal( null );

        done();

      } );

    } );

    it( 'returns the set count if fresh and exists', done => {

      jsdom.env( '<a>kaore ouaich</a>', ( err, w ) => {

        // this is for test env only
        clientSession.test.loadCookiesLib( cookiesLib( w ) );

        clientSession.notifications.setCount( 36 );

        clientSession.notifications.getCount().should.equal( 36 );

        done();

      } );

    } );

    it( '10 minutes in the future, count returns null', done => {

      jsdom.env( '<a>kaore ouaich</a>', ( err, w ) => {

        // this is for test env only
        clientSession.test.loadCookiesLib( cookiesLib( w ) );

        clientSession.notifications.setCount( 36 );

        // time is given to getter only to force different 'now'
        // for testing count invalidation
        let in10mn = new Date();

        in10mn.setTime( in10mn.getTime() + 1000 * 60 * 10 );

        should( clientSession.notifications.getCount( in10mn ) ).equal( null );

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
