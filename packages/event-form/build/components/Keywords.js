"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _reactTagsinput = require('react-tagsinput');

var _reactTagsinput2 = _interopRequireDefault(_reactTagsinput);

var _Sub = require('@openagenda/form-schemas/client/build/lib/Sub');

var _Sub2 = _interopRequireDefault(_Sub);

var _FieldCounter = require('@openagenda/form-schemas/client/build/lib/FieldCounter');

var _FieldCounter2 = _interopRequireDefault(_FieldCounter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = {
  flatten: require('lodash/flatten'),
  isArray: require('lodash/isArray'),
  get: require('lodash/get'),
  set: require('lodash/set')
};

module.exports = function (_Component) {
  _inherits(KeywordsComponent, _Component);

  function KeywordsComponent() {
    _classCallCheck(this, KeywordsComponent);

    return _possibleConstructorReturn(this, (KeywordsComponent.__proto__ || Object.getPrototypeOf(KeywordsComponent)).apply(this, arguments));
  }

  _createClass(KeywordsComponent, [{
    key: 'onChange',
    value: function onChange(language, value) {

      this.props.onChange((0, _immutabilityHelper2.default)(this.props.value || {}, _.set({}, language, {
        $set: value
      })));
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        'div',
        { className: 'keywords' },
        _react2.default.createElement(
          'ul',
          { className: 'list-unstyled' },
          this.props.field.languages.map(function (l) {
            return _react2.default.createElement(
              'li',
              { key: _this2.props.field.field + '_' + l },
              _react2.default.createElement(
                'div',
                { className: 'lang-input' },
                _react2.default.createElement(
                  'label',
                  null,
                  l
                ),
                _react2.default.createElement(
                  'div',
                  null,
                  _react2.default.createElement(_reactTagsinput2.default, {
                    value: preClean(_this2.props.value, l),
                    onChange: _this2.onChange.bind(_this2, l),
                    inputProps: {
                      placeholder: _this2.props.field.placeholder,
                      style: !_.get(_this2.props.value, l) ? { width: '630px' } : null
                    }
                  }),
                  _react2.default.createElement(_FieldCounter2.default, { value: _.get(_this2.props.value, l), max: _this2.props.field.max }),
                  _react2.default.createElement(_Sub2.default, { label: _this2.props.field.sub, error: _.get(_this2.props.error, l) })
                )
              )
            );
          })
        )
      );
    }
  }]);

  return KeywordsComponent;
}(_react.Component);

function preClean(value, lang) {

  var lValue = _.get(value, lang, []) || [];

  if (!_.isArray(lValue)) return [];

  return _.flatten(lValue.map(function (v) {
    return v.split(',').map(function (v) {
      return v.trim();
    });
  }));
}
//# sourceMappingURL=Keywords.js.map