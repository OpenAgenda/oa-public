"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/es.promise.js");
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));
var _merge2 = _interopRequireDefault(require("lodash/merge.js"));
var _axios = _interopRequireDefault(require("axios"));
var _qs = _interopRequireDefault(require("qs"));
var _Events = _interopRequireDefault(require("./Events"));
var _Locations = _interopRequireDefault(require("./Locations"));
var _reduceAccessToken = _interopRequireDefault(require("./utils/reduceAccessToken"));
var _getNonce = _interopRequireDefault(require("./utils/getNonce"));
class OaSdk {
  constructor(options) {
    (0, _defineProperty2.default)(this, "events", new _Events.default(this));
    (0, _defineProperty2.default)(this, "locations", new _Locations.default(this));
    this.params = (0, _merge2.default)({
      publicKey: null,
      secretKey: null
    }, options);
    this.accessToken = null;
    this.expiresIn = null;
    this.api = _axios.default.create({
      baseURL: process.env.NODE_ENV !== 'development' ? 'https://api.openagenda.com/v2' : 'https://dapi.openagenda.com/v2',
      paramsSerializer: _qs.default.stringify
    });
    this.api.interceptors.request.use(async config => {
      if (!config.skipRefreshToken && this.params.secretKey) {
        await this.refreshToken();
      }
      if (!config.skipAccessToken && this.accessToken) {
        config.headers = (0, _objectSpread2.default)({
          'access-token': this.accessToken
        }, config.headers);
      }
      if (!config.skipNonce && this.accessToken) {
        config.headers = (0, _objectSpread2.default)({
          nonce: (0, _getNonce.default)(this.reducedAccessToken, this.requestTokenTime)
        }, config.headers);
      }
      if (!config.skipPublicKey && config.method === 'get' && !this.accessToken) {
        config.params = (0, _objectSpread2.default)({
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
    this.reducedAccessToken = (0, _reduceAccessToken.default)(this.accessToken);
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
exports.default = OaSdk;
module.exports = exports.default;
//# sourceMappingURL=index.js.map