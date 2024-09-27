'use strict';

const { BadRequest } = require('@openagenda/verror');
const navValidator = require('../validators/nav');

describe('10 - validators - nav', () => {
  it('give it nothing and get default nav values', () => {
    expect(navValidator()).toEqual({
      from: 0,
      size: 20,
      page: 1,
    });
  });

  it('give it a page only and get all nav values', () => {
    expect(navValidator({ page: 2 })).toEqual({
      page: 2,
      from: 20,
      size: 20,
    });
  });

  it('give it a from and get all nav values', () => {
    expect(navValidator({ from: 20 })).toEqual({
      page: 2,
      from: 20,
      size: 20,
    });
  });

  it('give it an after and get an after', () => {
    expect(navValidator({ after: [1] })).toEqual({
      after: ['1'],
      size: 20,
      sort: null,
    });
  });

  it('possible values for sort are not random', () => {
    expect(() =>
      navValidator({
        sort: 'fqfdsqdf',
      })).toThrow(BadRequest);
  });

  it('sort value can be createdAt.desc', () => {
    expect(
      navValidator({
        sort: 'createdAt.desc',
      }).sort,
    ).toEqual('createdAt.desc');
  });

  it('BadRequest is thrown when nav from exeed max', () => {
    expect(() => navValidator({ from: 10001 })).toThrow(BadRequest);
  });

  it('BadRequest is thrown when nav contains invalid values', () => {
    expect(() => navValidator({ from: 'Truc' })).toThrow(BadRequest);
  });
});
