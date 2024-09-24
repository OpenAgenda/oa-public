/**
 * @jest-environment jsdom
 */

'use strict';

const cookie = require('js-cookie');
const base64 = require('@openagenda/utils/base64');
const isoConfig = require('../src/iso/config');
const clientSession = require('../src/client');

describe('session - functional (client): session', () => {
  beforeEach(() => {
    cookie.remove(isoConfig.cookies.session);
  });

  describe('.getUser', () => {
    it('returns user data if logged', () => {
      cookie.set(
        isoConfig.cookies.session,
        base64.encode(
          JSON.stringify({ user: { uid: 123, name: 'tony', culture: 'en' } }),
        ),
      );

      expect(clientSession.getUser()).toEqual({
        uid: 123,
        name: 'tony',
        culture: 'en',
        thumbnail: undefined,
      });
    });

    it('returns null when not logged', () => {
      expect(clientSession.getUser()).toBeNull();
    });
  });

  describe('.isLogged', () => {
    it('returns true if user is logged', () => {
      cookie.set(
        isoConfig.cookies.session,
        base64.encode(
          JSON.stringify({ user: { uid: 123, name: 'tony', culture: 'en' } }),
        ),
      );

      expect(clientSession.isLogged()).toBe(true);
    });

    it('... and false if not', () => {
      expect(clientSession.isLogged()).toBe(false);
    });
  });

  describe('.inbox', () => {
    it('getSummary - returns times at zero by default', () => {
      expect(clientSession.inbox.getSummary()).toEqual({
        lastRequestTime: 0,
        lastKnownState: false,
      });
    });

    it('getSummary - returns set times if any', () => {
      clientSession.inbox.setSummary({
        lastRequestTime: 1000,
        lastKnownState: true,
      });

      expect(clientSession.inbox.getSummary()).toEqual({
        lastRequestTime: 1000,
        lastKnownState: true,
      });
    });
  });

  describe('.notifications', () => {
    it('returns null if nothing is set', () => {
      expect(clientSession.notifications.getCount()).toBeNull();
    });

    it('returns the set count if fresh and exists', () => {
      clientSession.notifications.setCount(36);

      expect(clientSession.notifications.getCount()).toBe(36);
    });

    it('10 minutes in the future, count returns null', () => {
      clientSession.notifications.setCount(36);

      // time is given to getter only to force different 'now'
      // for testing count invalidation
      const in10mn = new Date();

      in10mn.setTime(in10mn.getTime() + 1000 * 60 * 10);

      expect(clientSession.notifications.getCount(in10mn)).toBeNull();
    });
  });

  describe('.flash', () => {
    it('returns null if no flash message is defined', () => {
      expect(clientSession.flash()).toBeNull();
    });

    it('if a flash is set, returns the flash value', () => {
      cookie.set(
        isoConfig.cookies.writable,
        base64.encode(JSON.stringify({ flash: 'grut' })),
      );

      expect(clientSession.flash()).toBe('grut');
    });

    it('if a flash is set, clears the value after call', () => {
      cookie.set(
        isoConfig.cookies.writable,
        base64.encode(JSON.stringify({ flash: 'grut' })),
      );

      clientSession.flash();

      expect(clientSession.flash()).toBeNull();
    });
  });
});
