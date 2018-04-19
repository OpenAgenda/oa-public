"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaults = {
  schemaMap: require('./defaults').camelCaseSchemaMap,
  res: null,
  pull: false,
  onTransferChange: function onTransferChange() {}
};

var extend = require('lodash/extend');

var schema = require('@openagenda/validators/schema');

var types = require('./credentialTypes');

var Link = require('./Link');

module.exports = function () {
  function _class(data, options, cb) {
    var _this = this;

    _classCallCheck(this, _class);

    var clean = _cleanConstructor([data, options, cb]);

    extend(this, {
      _schema: schema(clean.options.schemaMap),
      _fieldValues: _extractFieldValues(clean.data),
      _credential: _extractCredential(clean.data),
      _context: _extractContext(clean.data),
      _hooks: {
        onBusyChange: clean.options.onBusyChange
      }
    });

    var link = void 0;

    if (clean.options.res) {

      link = this.setRes(clean.options.res);
    }

    if (!clean.options.res || !clean.options.pull) {

      return clean.cb(null, this);
    }

    link.get(function (err, data) {

      if (err) {

        return clean.cb(err);
      }

      _this.set(data);

      clean.cb(null, _this);
    });
  }

  _createClass(_class, [{
    key: 'isValid',
    value: function isValid() {
      var partial = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


      return !this.getErrors(partial).length;
    }
  }, {
    key: 'setRes',
    value: function setRes(res) {

      this.link = new Link(res);

      this.link.setHooks(this._hooks);

      return this.link;
    }
  }, {
    key: 'hasRes',
    value: function hasRes() {

      return !!this.link;
    }
  }, {
    key: 'getErrors',
    value: function getErrors() {
      var partial = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


      var errors = [];

      try {

        this._schema(this._fieldValues);
      } catch (e) {
        errors = e;
      };

      if (!partial) return errors;

      return errors.filter(function (e) {
        return e.origin !== undefined && e.origin !== '';
      });
    }
  }, {
    key: 'set',
    value: function set(data) {

      this._fieldValues = _extractFieldValues(data);

      if (data && data.credential) {

        this._credential = data.credential;
      }

      if (data && data.context) {

        this._context = data.context;
      }

      return this.getErrors();
    }
  }, {
    key: 'get',
    value: function get(standardized) {

      if (this._credential === null && this._context === null && !standardized) {

        return this._fieldValues;
      }

      return extend({
        fieldValues: this._fieldValues
      }, this._credential ? {
        credential: this._credential
      } : {}, this._context ? {
        context: this._context
      } : {});
    }
  }, {
    key: 'isSynced',
    value: function isSynced(cb) {

      if (!this.link) return cb('No link is established with server');

      this.link.isSynced(this.get(true), cb);
    }
  }, {
    key: 'commit',
    value: function commit(allowPartial, cb) {
      var _this2 = this;

      if (arguments.length === 1) {
        cb = allowPartial;
        allowPartial = false;
      }

      if (!this.link) return cb('No link is established with server');

      var errors = this.getErrors(allowPartial);

      if (errors.length) {

        return cb(null, {
          success: false,
          valid: false,
          errors: errors
        });
      }

      this.link.commit(this.get(), function (err) {

        if (err) return cb(err);

        cb(null, extend({
          success: true,
          valid: true,
          errors: []
        }, _this2.get(true)));
      });
    }
  }]);

  return _class;
}();

function _cleanConstructor(args) {

  var options = {},
      data = null,
      cb = function cb() {};

  if (args.length === 3) {

    if (args[2]) cb = args[2];
    options = args[1];
    data = args[0];
  } else if (args.length === 2) {

    options = args[1];
    data = args[0];
  } else if (args.length === 1) {

    data = args[0];
  }

  return {
    data: data,
    options: extend({}, defaults, options),
    cb: cb
  };
}

function _extractFieldValues(data) {

  if (data && data.fieldValues) return data.fieldValues;

  return data;
}

function _extractCredential(data) {

  if (data && data.credential) return data.credential;

  return null;
}

function _extractContext(data) {

  if (data && data.context) return data.context;

  return null;
}
//# sourceMappingURL=Stakeholder.js.map