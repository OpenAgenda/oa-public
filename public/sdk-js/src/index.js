import _ from 'lodash';
import superagent from 'superagent';
import baseUrl from './baseUrl';
import Events from './Events';
import Locations from './Locations';
import parseJsonResponse from './utils/parseJsonResponse';
import reduceAccessToken from './utils/reduceAccessToken';

export default class OaSdk {
  constructor(options) {
    this.params = _.merge(
      {
        publicKey: null,
        secretKey: null,
      },
      options
    );

    this.accessToken = null;
    this.expiresIn = null;

    this.agent = superagent.agent();
  }

  events = new Events(this);

  locations = new Locations(this);

  async connect(secretKey) {
    const time = new Date().getTime();

    if (!this.params.secretKey) {
      this.params.secretKey = secretKey;
    }

    const response = await this.agent
      .post(`${baseUrl.v2}/requestAccessToken`)
      .accept('json')
      .send({
        'grant-type': 'authorization_code',
        code: secretKey || this.params.secretKey,
      })
      .then(parseJsonResponse);

    this.accessToken = response.body.access_token;
    this.expiresIn = response.body.expires_in;
    this.requestTokenTime = time;

    this.reducedAccessToken = reduceAccessToken(this.accessToken);

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

  getNonce() {
    const ms = new Date().getTime() - this.requestTokenTime;

    return parseInt(`${_.random(10 ** 5)}${this.reducedAccessToken}${ms}`, 10);
  }
}
