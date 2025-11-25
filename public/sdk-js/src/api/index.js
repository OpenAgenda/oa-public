import ky from 'ky';
import Events from './Events.js';
import Locations from './Locations.js';

export default class OaSdk {
  constructor(options) {
    this.params = {
      publicKey: null,
      secretKey: null,
      ...options,
    };

    this.accessToken = null;
    this.expiresIn = null;

    this.api = ky.create({
      prefixUrl:
        process.env.NODE_ENV !== 'development'
          ? 'https://api.openagenda.com/v2'
          : 'https://dapi.openagenda.com/v2',
      hooks: {
        beforeRequest: [
          async (request, reqOptions) => {
            if (!reqOptions.skipRefreshToken && this.params.secretKey) {
              await this.refreshToken();
            }

            if (!reqOptions.skipAccessToken && this.accessToken) {
              request.headers.set('access-token', this.accessToken);
            }

            if (
              !reqOptions.skipPublicKey
              && request.method === 'GET'
              && !this.accessToken
            ) {
              const url = new URL(request.url);
              url.searchParams.set('key', this.params.publicKey);

              return new Request(url, request);
            }
          },
        ],
        beforeError: [
          async (error) => {
            const { response } = error;

            if (response && response.body) {
              try {
                const contentType = response.headers.get('content-type') || '';

                if (contentType.includes('application/json')) {
                  error.response.data = await response.json();
                } else {
                  error.response.data = await response.text();
                }
              } catch (_) {
                try {
                  if (!error.response.data) {
                    error.response.data = await response.text();
                  }
                } catch (_1) {
                  //
                }
              }
            }

            return error;
          },
        ],
      },
    });
  }

  events = new Events(this);

  locations = new Locations(this);

  async connect(secretKey) {
    const time = new Date().getTime();

    if (!this.params.secretKey) {
      this.params.secretKey = secretKey;
    }

    const response = await this.api
      .post('requestAccessToken', {
        json: {
          'grant-type': 'authorization_code',
          code: secretKey || this.params.secretKey,
        },
        skipRefreshToken: true,
      })
      .json();

    this.accessToken = response.access_token;
    this.expiresIn = response.expires_in;
    this.requestTokenTime = time;

    return response;
  }

  async refreshToken() {
    if (this.tokenIsExpired()) {
      await this.connect();
    }
  }

  tokenIsExpired() {
    if (!this.accessToken) {
      return true;
    }

    return new Date().getTime() > this.requestTokenTime + this.expiresIn * 1000;
  }
}
