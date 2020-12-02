'use strict';

const cloudimage = require('../utils/cloudimage');

const BASE = 'https://{youraccountkey}.cloudimg.io/v7/';

const event = {
  image: 'https://cibul.s3.amazonaws.com/event_sauvages_818_239409.jpg'
};

const eventV2ExportFormat = {
  image: {
    base: 'https://cibul.s3.amazonaws.com/',
    filename: 'event_sauvages_818_239409.jpg'
  }
};

describe('18 - utils - cloudimage', () => {
  test('appends image link to format to cloudimage account url', () => {
    const link = cloudimage(BASE, event);

    expect(link).toBe(
      'https://{youraccountkey}.cloudimg.io/v7/https://cibul.s3.amazonaws.com/event_sauvages_818_239409.jpg'
    );
  });

  test('works with v2 export format', () => {
    const link = cloudimage(BASE, eventV2ExportFormat);

    expect(link).toBe(
      'https://{youraccountkey}.cloudimg.io/v7/https://cibul.s3.amazonaws.com/event_sauvages_818_239409.jpg'
    );
  });

  test('pass cloudimage query as third arg', () => {
    const link = cloudimage(BASE, event, {
      width: 400,
      grey: 1
    });

    expect(link).toBe(
      'https://{youraccountkey}.cloudimg.io/v7/https://cibul.s3.amazonaws.com/event_sauvages_818_239409.jpg?width=400&grey=1'
    );
  });
});
