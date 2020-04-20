'use strict';

const fs = require('fs');
const should = require('should');

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

  });

  describe('internal unit - do not use outside of service', () => {

    it('objectified fields derived from legacy public matches legacy format', () => {
      legacy.public.should.eql(fx.public);
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
