import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";
import _merge from "lodash/merge.js";
import "core-js/modules/es.promise.js";
import axios from 'axios';
import qs from 'qs';
import Events from './Events';
import Locations from './Locations';
import reduceAccessToken from './utils/reduceAccessToken';
import getNonce from './utils/getNonce';
export default class OaSdk {
  constructor(options) {
    _defineProperty(this, "events", new Events(this));
    _defineProperty(this, "locations", new Locations(this));
    this.params = _merge({
      publicKey: null,
      secretKey: null
    }, options);
    this.accessToken = null;
    this.expiresIn = null;
    this.api = axios.create({
      baseURL: process.env.NODE_ENV !== 'development' ? 'https://api.openagenda.com/v2' : 'https://dapi.openagenda.com/v2',
      paramsSerializer: qs.stringify
    });
    this.api.interceptors.request.use(async config => {
      if (!config.skipRefreshToken && this.params.secretKey) {
        await this.refreshToken();
      }
      if (!config.skipAccessToken && this.accessToken) {
        config.headers = _objectSpread({
          'access-token': this.accessToken
        }, config.headers);
      }
      if (!config.skipNonce && this.accessToken) {
        config.headers = _objectSpread({
          nonce: getNonce(this.reducedAccessToken, this.requestTokenTime)
        }, config.headers);
      }
      if (!config.skipPublicKey && config.method === 'get' && !this.accessToken) {
        config.params = _objectSpread({
          key: this.params.publicKey
        }, config.params);
      }
      return config;
    });
  }
  async connect(secretKey) {
    const time = new Date().getTime();
    if (!this.params.secretKey) {
      this.params.secretKey = secretKey;
    }
    const response = await this.api.post('/requestAccessToken', {
      'grant-type': 'authorization_code',
      code: secretKey || this.params.secretKey
    }, {
      skipRefreshToken: true // avoid loop
    });
    this.accessToken = response.data.access_token;
    this.expiresIn = response.data.expires_in;
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
}
//# sourceMappingURL=index.js.map