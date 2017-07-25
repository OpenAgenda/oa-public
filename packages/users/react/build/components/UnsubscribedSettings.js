'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _dec, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reactRouterRedux = require('react-router-redux');

var _camelCase = require('lodash/camelCase');

var _camelCase2 = _interopRequireDefault(_camelCase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  UnsubscribedSettings: {
    displayName: 'UnsubscribedSettings'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/UnsubscribedSettings.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var ucfirst = function ucfirst(str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
};

var UnsubscribedSettings = _wrapComponent('UnsubscribedSettings')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    unsubscriptions: state.userSettings.unsubscriptions,
    prefix: state.app.appSettings.prefix
  };
}, { push: _reactRouterRedux.push }), _dec(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(UnsubscribedSettings, _Component);

  function UnsubscribedSettings() {
    (0, _classCallCheck3.default)(this, UnsubscribedSettings);
    return (0, _possibleConstructorReturn3.default)(this, (UnsubscribedSettings.__proto__ || (0, _getPrototypeOf2.default)(UnsubscribedSettings)).apply(this, arguments));
  }

  (0, _createClass3.default)(UnsubscribedSettings, [{
    key: 'render',
    value: function render() {
      var getLabels = this.context.getLabels;
      var _props = this.props,
          activeTab = _props.activeTab,
          push = _props.push,
          unsubscriptions = _props.unsubscriptions,
          removeUnsubscription = _props.removeUnsubscription,
          prefix = _props.prefix;


      return _react3.default.createElement(
        'tr',
        {
          onClick: !activeTab ? function () {
            return push(prefix + '/unsubscribed');
          } : null,
          className: !activeTab ? 'inactive' : ''
        },
        _react3.default.createElement(
          'td',
          { onClick: activeTab ? function () {
              return push(prefix + '/');
            } : null,
            className: 'col-md-3', style: { cursor: 'pointer' } },
          getLabels('emailUnsubscription')
        ),
        activeTab ? _react3.default.createElement(
          'td',
          null,
          _react3.default.createElement(
            'div',
            { style: { padding: '0 5px' } },
            _react3.default.createElement(
              'p',
              null,
              getLabels('yourUnsubscriptions')
            ),
            _react3.default.createElement(
              'div',
              null,
              unsubscriptions && unsubscriptions.length > 0 && unsubscriptions.map(function (unsubscription) {
                return _react3.default.createElement(
                  'div',
                  { key: unsubscription.id, className: 'margin-v-sm' },
                  _react3.default.createElement(
                    'span',
                    {
                      style: { cursor: 'pointer', marginTop: '-2px', fontSize: '18px' },
                      className: 'text-danger pull-right',
                      'aria-hidden': 'true',
                      onClick: function onClick() {
                        return removeUnsubscription(unsubscription);
                      }
                    },
                    '\xD7'
                  ),
                  unsubscription.agenda ? unsubscription.agenda.title : ucfirst(unsubscription.subject),
                  ':',
                  ' ',
                  _react3.default.createElement(
                    'b',
                    null,
                    getLabels((0, _camelCase2.default)(unsubscription.type)) || getLabels('allNotifications')
                  )
                );
              }),
              (!unsubscriptions || !unsubscriptions.length) && _react3.default.createElement(
                'p',
                null,
                getLabels('noUnsubscription')
              )
            )
          )
        ) : _react3.default.createElement('td', { style: { cursor: 'pointer' } })
      );
    }
  }]);
  return UnsubscribedSettings;
}(_react2.Component), _class2.propTypes = {
  unsubscriptions: _propTypes2.default.array,
  push: _propTypes2.default.func
}, _class2.contextTypes = {
  getLabels: _propTypes2.default.func
}, _temp)) || _class));

exports.default = UnsubscribedSettings;
module.exports = exports['default'];