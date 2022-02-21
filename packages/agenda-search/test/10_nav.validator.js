'use strict';

const assert = require('assert');
const navValidator = require('../validators/nav');

describe('10 - validators - nav', () => {

  it('give it nothing and get default nav values', () => {
    assert.deepEqual(
      navValidator(),
      {
        from: 0,
        size: 20,
        page: 1
      }
    );
  });

  it('give it a page only and get all nav values', () => {
    assert.deepEqual(
      navValidator({ page: 2 }),
      {
        page: 2,
        from: 20,
        size: 20
      }
    );
  });

  it('give it a from and get all nav values', () => {
    assert.deepEqual(
      navValidator({ from: 20 }),
      {
        page: 2,
        from: 20,
        size: 20
      }
    );
  });

  it('give it an after and get an after', () => {
    assert.deepEqual(
      navValidator({ after: [1] }),
      {
        after: [1],
        size: 20,
        sort: null
      }
    );
  });

  it('possible values for sort are not random', () => {
    try {
      navValidator({
        sort: 'fqfdsqdf'
      });
    } catch (error) {
      assert.equal(error.name, 'BadRequest');
      return;
    }

    throw new Error('Should not reach here');
  });

  it('sort value can be createdAt.desc', () => {
    assert.equal(navValidator({
      sort: 'createdAt.desc'
    }).sort, 'createdAt.desc');
  });

  it('BadRequest is thrown when nav contains invalid values', () => {
    try {
      navValidator({
        from: 'Truc'
      });
    } catch (error) {
      assert.equal(error.name, 'BadRequest');
      return;
    }
    throw new Error('should not reach here');
  });
});
