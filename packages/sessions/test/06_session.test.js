/**
 * @jest-environment jsdom
 */

import cookie from 'js-cookie';
import base64 from '@openagenda/utils/base64.js';
import isoConfig from '../src/iso/config.js';
import clientSession from '../src/client/index.js';

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
