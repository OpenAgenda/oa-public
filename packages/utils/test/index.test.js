"use strict";

const utils = require('../');

describe('utils - capitalize', () => {

  it('ok', () => {
    expect(utils.capitalize('capthis')).toBe('Capthis');
  });

  it('capitalize bad input', () => {
    expect(utils.capitalize('')).toBe('');
  });

  it('not a string', () => {
    expect(utils.capitalize(34)).toBe('34');
  });

  it('uncapitalize', () => {
    expect(utils.uncapitalize('Uncapthis')).toBe('uncapthis');
  });

});
