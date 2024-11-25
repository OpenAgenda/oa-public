import base64 from '@openagenda/utils/base64.js';
import expressCookie from '../src/service/expressCookie.js';
import config from '../testconfig.js';

const cookieName = config.writableCookie.name;

describe('session - unit (server): express cookies', () => {
  it('expressCookie get gets values of a cookie in an express request', () => {
    const ec = expressCookie(
      config,
      /* request obj */ {
        cookies: {
          [cookieName]: base64.encode(JSON.stringify({ the: 'content' })),
        },
      },
    );

    expect(ec.get()).toEqual({ the: 'content' });
  });

  it('expressCookie set sets a given named value in express request and response', () => {
    const responseCookie = {};

    const ec = expressCookie(
      config,
      /* request obj */ {
        cookies: {
          [cookieName]: base64.encode(JSON.stringify({ the: 'content' })),
        },
      },
      /* response obj */ {
        cookie: (name, values, _options) => {
          responseCookie[name] = values;
        },
      },
    );

    ec.set('is', 'updated');

    expect(responseCookie[cookieName]).toBe(
      base64.encode(JSON.stringify({ the: 'content', is: 'updated' })),
    );
  });

  it('expressCookie clear removes all values from cookie', () => {
    const responseCookie = {};

    const ec = expressCookie(
      config,
      /* request obj */ {
        cookies: {
          [cookieName]: base64.encode(JSON.stringify({ the: 'content' })),
        },
      },
      /* response obj */ {
        cookie: (name, values, _options) => {
          responseCookie[name] = values;
        },
      },
    );

    ec.clear();

    expect(responseCookie[cookieName]).toEqual(
      base64.encode(JSON.stringify({})),
    );
  });
});
