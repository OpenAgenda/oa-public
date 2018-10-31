"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');
var axios = require('axios');
var mdExtractor = require('markdown-link-extractor');
var VError = require('verror');

var logger = require('@openagenda/logs');
var log = logger('main');

var cleanOptions = require('./validators/options');
var cleanFromMarkdownOptions = require('./validators/fromMarkdownOptions');

var oe = null; // service instance

var OEmbed = function () {
  function OEmbed(options) {
    _classCallCheck(this, OEmbed);

    try {

      this.params = cleanOptions(options);

      this.params.filters = this.params.filters.map(function (f) {
        return new RegExp(f);
      });
    } catch (errors) {

      throw new Error('options are not valid', errors);
    }
  }

  _createClass(OEmbed, [{
    key: 'get',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
        var result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:

                log('getting data for %s', url);

                _context.t0 = _;
                _context.next = 4;
                return axios.get(this.params.iframely.res, {
                  params: {
                    api_key: this.params.iframely.key,
                    url: url
                  }
                });

              case 4:
                _context.t1 = _context.sent;
                result = _context.t0.get.call(_context.t0, _context.t1, 'data');


                log('retrieved data for %s', url);

                return _context.abrupt('return', result);

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function get(_x) {
        return _ref.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: 'fromMarkdown',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var _this = this;

        var md = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var cleanOptions, urls;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                cleanOptions = cleanFromMarkdownOptions(options);
                urls = _.uniq(mdExtractor(md).filter(function (link) {
                  return !!_this.params.filters.filter(function (filter) {
                    return filter.test(link);
                  }).length;
                }));
                _context3.next = 4;
                return Promise.all(urls.map(function () {
                  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url) {
                    var result, matchingCurrent;
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            result = null;
                            matchingCurrent = _.first(cleanOptions.current.filter(function (c) {
                              return c.link === url;
                            }));

                            if (!matchingCurrent) {
                              _context2.next = 4;
                              break;
                            }

                            return _context2.abrupt('return', matchingCurrent);

                          case 4:
                            _context2.prev = 4;
                            _context2.t0 = url;
                            _context2.next = 8;
                            return _this.get(url);

                          case 8:
                            _context2.t1 = _context2.sent;
                            result = {
                              link: _context2.t0,
                              data: _context2.t1
                            };
                            _context2.next = 15;
                            break;

                          case 12:
                            _context2.prev = 12;
                            _context2.t2 = _context2['catch'](4);


                            log('error', 'could not retrieve code for %s', url, _context2.t2);

                          case 15:
                            return _context2.abrupt('return', result);

                          case 16:
                          case 'end':
                            return _context2.stop();
                        }
                      }
                    }, _callee2, _this, [[4, 12]]);
                  }));

                  return function (_x4) {
                    return _ref3.apply(this, arguments);
                  };
                }()));

              case 4:
                _context3.t0 = function (r) {
                  return !!r;
                };

                return _context3.abrupt('return', _context3.sent.filter(_context3.t0));

              case 6:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function fromMarkdown() {
        return _ref2.apply(this, arguments);
      }

      return fromMarkdown;
    }()
  }]);

  return OEmbed;
}();

module.exports = OEmbed;

module.exports.init = function (config) {

  if (_.get(config, 'logger')) {

    logger.setModuleConfig(_.get(config, 'logger'));
  }

  if (_.get(config, 'options')) {

    oe = new OEmbed(_.get(config, 'options'));
  }
};

module.exports.fromMarkdown = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(text) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (oe) {
              _context4.next = 2;
              break;
            }

            throw new Error('Service is not initialized');

          case 2:
            return _context4.abrupt('return', oe.fromMarkdown(text, options));

          case 3:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function (_x5) {
    return _ref4.apply(this, arguments);
  };
}();

module.exports.get = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(url) {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (oe) {
              _context5.next = 2;
              break;
            }

            throw new Error('Service is not initialized');

          case 2:
            return _context5.abrupt('return', oe.get(url));

          case 3:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function (_x7) {
    return _ref5.apply(this, arguments);
  };
}();
//# sourceMappingURL=index.js.map