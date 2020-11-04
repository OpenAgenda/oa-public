'use strict';

const assert = require('assert');
const validators = require('../validators');

/**
 * this is a validator created from schemas of the
 * validator repo, extensive tests are done there.
 * Only few specific tests are done here for documentation
 * purposes
 */

describe('validators - query', () => {

  it('give it nothing and get default query values', () => {
    assert.deepEqual(validators.query(), {
      uid: null,
      contributionType: null,
      search: null,
      official: null,
      sort: null,
      network: null,
      updatedAt: {
        gte: null,
        lte: null
      }
    });
  });

  it('possible values for sort are not random', () => {
    let errors = [];

    try {
      validators.query({
        sort: 'fqfdsqdf'
      });
    } catch(e) { errors = e; }

    assert.deepEqual(errors, [{
      origin: 'fqfdsqdf',
      field: 'sort',
      code: 'sort.invalid',
      message: 'sort value is not valid'
    }]);
  });

  it('sort value can be createdAt.desc', () => {
    assert.equal(validators.query({
      sort: 'createdAt.desc'
    }).sort, 'createdAt.desc');
  });

});
