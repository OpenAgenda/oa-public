'use strict';

const assert = require('assert');
const queryValidator = require('../validators/query');

/**
 * this is a validator created from schemas of the
 * validator repo, extensive tests are done there.
 * Only few specific tests are done here for documentation
 * purposes
 */

describe('11 - validators - query', () => {

  it('give it nothing and get default query values', () => {
    assert.deepEqual(queryValidator(), {
      uid: null,
      contributionType: null,
      search: null,
      official: null,
      network: null,
      locationSet: null,
      updatedAt: {
        gte: null,
        lte: null
      },
      slug: null
    });
  });

  it('BadRequest is thrown when query contains invalid values', () => {
    let error;
    try {
      queryValidator({
        network: 'Truc'
      });
    } catch (e) {
      error = e;
    }
    assert.equal(error.name, 'BadRequest');
  });
});
