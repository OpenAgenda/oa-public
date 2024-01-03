'use strict';

const fs = require('fs');
const assert = require('assert');

const {
  utils
} = require('../service');

const fx = {
  private: require('./fixtures/privateFields.json'),
  public: require('./fixtures/publicFields.json'),
  all: require('./fixtures/allFields.json'),
  credentials: require('./fixtures/credentials.json')
}

const legacy = require('../service/validate/fields/legacy');

describe('agendas - utils', () => {

  describe('filterByAccess', () => {

    it('if access is unspecified or public, public fields are provided', () => {
      const filtered = utils.filterByAccess({
        title: 'Un agenda'
      });

      expect(filtered).toEqual({
        title: 'Un agenda'
      });
    });

    it('if access is given unlisted value defaults to public', () => {
      const filtered = utils.filterByAccess({
        title: 'Un agenda'
      }, 'read', 'hobgoblin');

      expect(filtered).toEqual({
        title: 'Un agenda'
      });
    });

    it('a field with internal read access is filtered out if requested access is public', () => {
      const filtered = utils.filterByAccess({
        id: 218,
        title: 'Un agenda'
      });

      expect(filtered).toEqual({
        title: 'Un agenda'
      });
    });

    it('a field with internal read access is only provided if internal is requested', () => {
      const filtered = utils.filterByAccess({
        id: 218,
        title: 'Un agenda'
      }, 'read', 'internal');

      expect(filtered).toEqual({
        id: 218,
        title: 'Un agenda'
      });
    });

    it('contribution types can be read accessed by an administrator', () => {
      const filtered = utils.filterByAccess({
        settings: {
          contribution: {
            type: 1
          }
        }
      }, 'read', 'administrator');

      expect(filtered.settings.contribution.type).toBe(1);
    });

  });

  describe('internal unit - do not use outside of service', () => {

    it('objectified fields derived from legacy public matches legacy format', () => {
      assert.deepStrictEqual(legacy.public, fx.public);
    });

    it('objectified fields derived from legacy private matches legacy format', () => {
      expect(legacy.private).toEqual(fx.private);
    });

    it('objectified fields derived from legacy validation fields matches legacy format', () => {
      expect(legacy.all).toEqual(fx.all);
    });

    it('list existing credentials', () => {
      expect(utils.credentials).toEqual(fx.credentials);
    });

  });

});
