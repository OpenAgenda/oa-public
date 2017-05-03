'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _class2, _temp;

var _reactRedux = require('react-redux');

var _reactRouterRedux = require('react-router-redux');

var _camelCase = require('lodash/camelCase');

var _camelCase2 = _interopRequireDefault(_camelCase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var UnsubscribedSettings = _wrapComponent('UnsubscribedSettings')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    unsubscriptions: state.userSettings.unsubscriptions
  };
}, { push: _reactRouterRedux.push }), _dec(_class = (_temp = _class2 = function (_Component) {
  _inherits(UnsubscribedSettings, _Component);

  function UnsubscribedSettings() {
    _classCallCheck(this, UnsubscribedSettings);

    return _possibleConstructorReturn(this, (UnsubscribedSettings.__proto__ || Object.getPrototypeOf(UnsubscribedSettings)).apply(this, arguments));
  }

  _createClass(UnsubscribedSettings, [{
    key: 'render',
    value: function render() {
      var getLabels = this.context.getLabels;
      var _props = this.props,
          activeTab = _props.activeTab,
          push = _props.push,
          unsubscriptions = _props.unsubscriptions,
          removeUnsubscription = _props.removeUnsubscription;


      return _react3.default.createElement(
        'tr',
        {
          onClick: !activeTab ? function () {
            return push('/unsubscribed');
          } : null,
          className: !activeTab ? 'inactive' : ''
        },
        _react3.default.createElement(
          'td',
          { onClick: activeTab ? function () {
              return push('/');
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
                  unsubscription.agenda.title,
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
  unsubscriptions: _react2.PropTypes.array,
  push: _react2.PropTypes.func
}, _class2.contextTypes = {
  getLabels: _react2.PropTypes.func
}, _temp)) || _class));

exports.default = UnsubscribedSettings;
module.exports = exports['default'];