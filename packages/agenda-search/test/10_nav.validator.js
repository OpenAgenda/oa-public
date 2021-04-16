'use strict';

const assert = require('assert');
const validators = require('../validators');

describe('10 - validators - nav', () => {

  it('give it nothing and get default nav values', () => {
    assert.deepEqual(
      validators.nav(),
      {
        page: 1,
        offset: 0,
        limit: 20
      }
    );
  });

  it('give it a page only and get all nav values', () => {
    assert.deepEqual(
      validators.nav({ page: 2 }),
      {
        page: 2,
        offset: 20,
        limit: 20
      }
    );
  });

  it('give it an offset and get all nav values', () => {
    assert.deepEqual(
      validators.nav({ offset: 20 }),
      {
        page: 2,
        offset: 20,
        limit: 20
      }
    );
  });

})