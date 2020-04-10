'use strict';

const should = require('should');

const {
  utils
} = require('../');

describe('agendas - utils: filterByAccess', () => {

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
    }, 'internal');

    filtered.should.eql({
      id: 218,
      title: 'Un agenda'
    });
  });

});
