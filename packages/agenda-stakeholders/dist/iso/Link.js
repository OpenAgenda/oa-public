"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = {
  extend: require('lodash/extend'),
  isEqual: require('lodash/isEqual')
};

var sa = require('superagent');

var defaults = {
  timeout: 10000,
  res: null
};

module.exports = function () {
  function _class(config) {
    _classCallCheck(this, _class);

    this.params = _.extend({}, defaults, typeof config === 'string' ? { res: config } : config);

    this.setRes(this.params.res);

    _.extend(this, {
      _busy: false,
      _cached: null
    });
  }

  _createClass(_class, [{
    key: 'isSynced',
    value: function isSynced(data, cb) {
      var _this = this;

      this.get(function (err, remoteData) {

        if (err) return cb(err);

        return cb(null, _this._compareCached(data));
      });
    }
  }, {
    key: 'isBusy',
    value: function isBusy() {

      return this._busy;
    }
  }, {
    key: 'setHooks',
    value: function setHooks(hooks) {

      this._hooks = hooks || {};
    }
  }, {
    key: 'get',
    value: function get(cb) {
      var _this2 = this;

      if (this._cached) return cb(null, this._cached);

      if (this.isBusy()) {

        return cb('cannot commit, link is already busy');
      }

      this._busyChange(true);

      sa.get(this.getRes()).timeout(this.params.timeout).send().end(function (err, res) {

        _this2._busyChange(false);

        if (err) return cb(err);

        _this2._cached = res.body;

        cb(null, res.body);
      });
    }
  }, {
    key: 'commit',
    value: function commit(data, cb) {
      var _this3 = this;

      if (!this.hasRes()) {

        return cb('no ressource is defined');
      }

      if (this.isBusy()) {

        return cb('cannot commit, link is already busy');
      }

      this._busyChange(true);

      sa.post(this.getRes()).timeout(this.params.timeout).send(data).end(function (err, res) {

        _this3._busyChange(false);

        if (err) return cb(err);

        _this3._cached = res.body;

        cb(null);
      });
    }
  }, {
    key: 'setRes',
    value: function setRes(res) {

      this._res = res;
    }
  }, {
    key: 'hasRes',
    value: function hasRes() {

      return !!this._res;
    }
  }, {
    key: 'getRes',
    value: function getRes() {

      return this._res;
    }
  }, {
    key: 'isBusy',
    value: function isBusy() {

      return !!this._busy;
    }
  }, {
    key: '_compareCached',
    value: function _compareCached(data) {

      return _.isEqual(data, this._cached);
    }
  }, {
    key: '_busyChange',
    value: function _busyChange(value) {

      if (this._busy === !!value) return;

      this._busy = !!value;

      this._callHook('onBusyChange', value);
    }
  }, {
    key: '_callHook',
    value: function _callHook(hook, value) {

      if (this._hooks && this._hooks[hook]) {

        this._hooks[hook](value);
      }
    }
  }]);

  return _class;
}();
//# sourceMappingURL=Link.js.map