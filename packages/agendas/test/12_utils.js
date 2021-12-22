'use strict';

const fs = require('fs');
const should = require('should');
const assert = require('assert');

const {
  utils
} = require('../');

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

      filtered.should.eql({
        title: 'Un agenda'
      });
    });

    it('if access is given unlisted value defaults to public', () => {
      const filtered = utils.filterByAccess({
        title: 'Un agenda'
      }, 'read', 'hobgoblin');

      filtered.should.eql({
        title: 'Un agenda'
      });
    });

    it('a field with internal read access is filtered out if requested access is public', () => {
      const filtered = utils.filterByAccess({
        id: 218,
        title: 'Un agenda'
      });

      filtered.should.eql({
        title: 'Un agenda'
      });
    });

    it('a field with internal read access is only provided if internal is requested', () => {
      const filtered = utils.filterByAccess({
        id: 218,
        title: 'Un agenda'
      }, 'read', 'internal');

      filtered.should.eql({
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

      filtered.settings.contribution.type.should.equal(1);
    });

  });

  describe('internal unit - do not use outside of service', () => {

    it('objectified fields derived from legacy public matches legacy format', () => {
      assert.deepStrictEqual(legacy.public, fx.public);
    });

    it('objectified fields derived from legacy private matches legacy format', () => {
      legacy.private.should.eql(fx.private);
    });

    it('objectified fields derived from legacy validation fields matches legacy format', () => {
      legacy.all.should.eql(fx.all);
    });

    it('list existing credentials', () => {
      utils.credentials.should.eql(fx.credentials);
    });

  });

});
