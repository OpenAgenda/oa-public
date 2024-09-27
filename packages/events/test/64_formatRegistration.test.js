'use strict';

const { formatRegistration } = require('..').utils;

describe('formatRegistration', () => {
  it('if order option is provided, sorts registration values according to provided types in option', () => {
    const formatted = formatRegistration(
      [
        '01 09 09183',
        'romain@oa.com',
        'https://link.com',
        'https://otherlink.com',
        'email@email.com',
      ],
      {
        order: ['email', 'phone', 'link'],
      },
    );

    expect(formatted).toEqual([
      'email@email.com',
      'romain@oa.com',
      '01 09 09183',
      'https://otherlink.com',
      'https://link.com',
    ]);
  });

  it('if includeLinkPrefix option is true, appends registration value with corresponding link prefix', () => {
    const formatted = formatRegistration(
      [
        '01 09 09183',
        'romain@oa.com',
        'link.com',
        'https://otherlink.com',
        'email@email.com',
      ],
      {
        includeLinkPrefix: true,
      },
    );

    expect(formatted).toEqual([
      'tel:01 09 09183',
      'mailto:romain@oa.com',
      'https://link.com',
      'https://otherlink.com',
      'mailto:email@email.com',
    ]);
  });

  it('if useTypeKeys option is true, assigns values to keys matching their types', () => {
    const formatted = formatRegistration(
      [
        '01 09 09183',
        'romain@oa.com',
        'https://link.com',
        'https://otherlink.com',
        'email@email.com',
      ],
      {
        useTypeKeys: true,
      },
    );

    expect(formatted).toEqual({
      link: ['https://link.com', 'https://otherlink.com'],
      phone: ['01 09 09183'],
      email: ['romain@oa.com', 'email@email.com'],
    });
  });

  it('if undefined is provided, returns empty array', () => {
    expect(formatRegistration()).toEqual([]);
  });

  it('if null is provided, returns empty array', () => {
    expect(formatRegistration(null)).toEqual([]);
  });

  it('if invalid type is provided, it is filtered out', () => {
    expect(formatRegistration(['fdsqfdqs'])).toEqual([]);
  });
});
