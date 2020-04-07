'use strict';

const isEventHref = require('../client/lib/isEventHref');

describe('isEventHref', () => {
  it('is', () => {
    expect(
      isEventHref(
        'http://localhost:3000/events/funk-vibration-de-nicolas-gardel?nc=eyJpbmRleCI6MCwidG90YWwiOjgzfQ%3D%3D&oaq%5Bfrom%5D=2020-04-18&oaq%5Bto%5D=2020-04-18'
      )
    ).toBe(true);
  });

  it('is not', () => {
    expect(isEventHref('http://localhost:3000/p/4?')).toBe(false);
  });
});
