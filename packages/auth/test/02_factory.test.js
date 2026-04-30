import Auth from '../src/index.js';

describe('auth - unit: Auth factory', () => {
  it('throws when mysqlPool is missing', () => {
    expect(() => Auth({})).toThrow(/mysqlPool is required/);
  });
});
