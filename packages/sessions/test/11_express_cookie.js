'use strict';

const base64 = require('@openagenda/utils/base64');
const expressCookie = require('../src/service/expressCookie');
const config = require('../testconfig');

describe('session - unit (server): express cookies', () => {
  beforeEach(() => expressCookie.init(config));

  it('expressCookie get gets values of a cookie in an express request', () => {
    const ec = expressCookie(
      'grut',
      /* request obj */ {
        cookies: {
          grut: base64.encode(JSON.stringify({ the: 'content' })),
        },
      },
    );

    expect(ec.get()).toEqual({ the: 'content' });
  });

  it('expressCookie set sets a given named value in express request and response', () => {
    const responseCookie = {};

    const ec = expressCookie(
      'grut',
      /* request obj */ {
        cookies: {
          grut: base64.encode(JSON.stringify({ the: 'content' })),
        },
      },
      /* response obj */ {
        cookie: (name, values, _options) => {
          responseCookie[name] = values;
        },
      },
    );

    ec.set('is', 'updated');

    expect(responseCookie.grut).toBe(
      base64.encode(JSON.stringify({ the: 'content', is: 'updated' })),
    );
  });

  it('expressCookie clear removes all values from cookie', () => {
    const responseCookie = {};

    const ec = expressCookie(
      'grut',
      /* request obj */ {
        cookies: {
          grut: base64.encode(JSON.stringify({ the: 'content' })),
        },
      },
      /* response obj */ {
        cookie: (name, values, _options) => {
          responseCookie[name] = values;
        },
      },
    );

    ec.clear();

    expect(responseCookie.grut).toEqual(base64.encode(JSON.stringify({})));
  });
});
