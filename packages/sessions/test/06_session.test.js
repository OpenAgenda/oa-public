"use strict";

const jsdom = require( 'jsdom' );
const cookiesLib = require( 'cookies-js' );
const base64 = require( '@openagenda/utils/base64' );
const isoConfig = require( '../src/iso/config' );
const clientSession = require( '../src/client' );

describe( 'session - functional (client): session', () => {

  let cookie;

  beforeEach(() => {
    const { window } = new jsdom.JSDOM();

    cookie = cookiesLib(window);
  });

  describe( '.getUser', () => {

    it( 'returns user data if logged', () => {

      clientSession.test.loadCookiesLib( cookie );

      cookie.set( isoConfig.cookies.session, base64.encode( JSON.stringify( { user: { uid: 123, name: 'tony', culture: 'en' } } ) ) );

      expect(
        clientSession.getUser()
      ).toEqual( {
        uid: 123,
        name: 'tony',
        culture: 'en',
        thumbnail: undefined
      } );

    } );

    it( 'returns null when not logged', () => {

      clientSession.test.loadCookiesLib( cookie );

      expect( clientSession.getUser() ).toBeNull();

    } );

  } );

  describe( '.isLogged', function() {

    it( 'returns true if user is logged', () => {

      clientSession.test.loadCookiesLib( cookie );

      cookie.set( isoConfig.cookies.session, base64.encode( JSON.stringify( { user: { uid: 123, name: 'tony', culture: 'en' } } ) ) );

      expect(
        clientSession.isLogged(),
      ).toBe(true);

    } );

    it( '... and false if not', () => {

      clientSession.test.loadCookiesLib( cookie );

      expect(
        clientSession.isLogged()
      ).toBe(false);

    } );

  } );


  describe( '.inbox', () => {

    it( 'getSummary - returns times at zero by default', () => {

      // this is for test env only
      clientSession.test.loadCookiesLib( cookie );

      expect(
        clientSession.inbox.getSummary()
      ).toEqual( {
        lastRequestTime: 0,
        lastKnownState: false
      } );

    } );

    it( 'getSummary - returns set times if any', () => {

      // this is for test env only
      clientSession.test.loadCookiesLib( cookie );

      clientSession.inbox.setSummary( {
        lastRequestTime: 1000,
        lastKnownState: true
      } );

      expect(
        clientSession.inbox.getSummary()
      ).toEqual( {
        lastRequestTime: 1000,
        lastKnownState: true
      } );

    } );

  } );


  describe( '.notifications', () => {

    it( 'returns null if nothing is set', () => {

      // this is for test env only
      clientSession.test.loadCookiesLib( cookie );

      expect( clientSession.notifications.getCount() ).toBeNull();

    } );

    it( 'returns the set count if fresh and exists', () => {

      // this is for test env only
      clientSession.test.loadCookiesLib( cookie );

      clientSession.notifications.setCount( 36 );

      expect(clientSession.notifications.getCount()).toBe(36);

    } );

    it( '10 minutes in the future, count returns null', () => {

      // this is for test env only
      clientSession.test.loadCookiesLib( cookie );

      clientSession.notifications.setCount( 36 );

      // time is given to getter only to force different 'now'
      // for testing count invalidation
      const in10mn = new Date();

      in10mn.setTime( in10mn.getTime() + 1000 * 60 * 10 );

      expect(clientSession.notifications.getCount( in10mn )).toBeNull();

    } );

  } );

  describe( '.flash', () => {

    it( 'returns null if no flash message is defined', () => {
      // necessary for initializing cookies lib in test
      // environment - see cookies-js documentation
      clientSession.test.loadCookiesLib( cookie );

      expect( clientSession.flash() ).toBeNull();
    } );

    it( 'if a flash is set, returns the flash value', () => {

      clientSession.test.loadCookiesLib( cookie );

      cookie.set( isoConfig.cookies.writable, base64.encode( JSON.stringify( { flash: 'grut' } ) ) );

      expect(clientSession.flash()).toBe('grut');

    } );

    it( 'if a flash is set, clears the value after call', () => {

      clientSession.test.loadCookiesLib( cookie );

      cookie.set( isoConfig.cookies.writable, base64.encode( JSON.stringify( { flash: 'grut' } ) ) );

      clientSession.flash();

      expect(clientSession.flash()).toBeNull();

    } );

  } );

} );
