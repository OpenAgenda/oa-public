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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _dec, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _reactCopyToClipboard = require('react-copy-to-clipboard');

var _reactCopyToClipboard2 = _interopRequireDefault(_reactCopyToClipboard);

var _MoreInfo = require('@openagenda/react-components/build/MoreInfo');

var _MoreInfo2 = _interopRequireDefault(_MoreInfo);

var _EditKeyForm = require('./EditKeyForm');

var _EditKeyForm2 = _interopRequireDefault(_EditKeyForm);

var _keys = require('../redux/modules/keys');

var keysActions = _interopRequireWildcard(_keys);

var _modals = require('../redux/modules/modals');

var modalsActions = _interopRequireWildcard(_modals);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  KeysManager: {
    displayName: 'KeysManager'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/KeysManager.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var KeysManager = _wrapComponent('KeysManager')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    keys: state.keys.data.items,
    total: state.keys.data.total
  };
}, _extends({}, keysActions, modalsActions)), _dec(_class = (_temp = _class2 = function (_Component) {
  _inherits(KeysManager, _Component);

  function KeysManager() {
    _classCallCheck(this, KeysManager);

    var _this = _possibleConstructorReturn(this, (KeysManager.__proto__ || Object.getPrototypeOf(KeysManager)).call(this));

    _this.state = {
      inEdition: [],
      copied: []
    };

    _this.renderKey = _this.renderKey.bind(_this);
    _this.handleCopy = _this.handleCopy.bind(_this);
    _this.closeEdition = _this.closeEdition.bind(_this);
    return _this;
  }

  _createClass(KeysManager, [{
    key: 'closeEdition',
    value: function closeEdition(id) {
      this.setState((0, _immutabilityHelper2.default)(this.state, {
        inEdition: { $apply: function $apply(arr) {
            return arr.filter(function (v) {
              return v !== id;
            });
          } }
      }));
    }
  }, {
    key: 'handleCopy',
    value: function handleCopy(id) {
      var _this2 = this;

      this.setState((0, _immutabilityHelper2.default)(this.state, { copied: { $push: [id] } }));
      setTimeout(function () {
        _this2.setState((0, _immutabilityHelper2.default)(_this2.state, {
          copied: { $apply: function $apply(arr) {
              return arr.filter(function (v) {
                return v !== id;
              });
            } }
        }));
      }, 2000);
    }
  }, {
    key: 'renderKey',
    value: function renderKey(item, index) {
      var _this3 = this;

      var _props = this.props,
          updateKey = _props.update,
          showModal = _props.showModal;
      var getLabel = this.context.getLabel;
      var _state = this.state,
          copied = _state.copied,
          inEdition = _state.inEdition;


      return _react3.default.createElement(
        'div',
        { className: 'row margin-bottom-sm', key: index },
        _react3.default.createElement(
          'div',
          { className: 'col-md-4' },
          inEdition.includes(item.id) ? _react3.default.createElement(_EditKeyForm2.default, {
            index: index,
            item: item,
            initialValues: { label: item.label },
            onSubmit: function onSubmit(values) {
              return updateKey(item.key, values).then(function () {
                return _this3.closeEdition(item.id);
              });
            },
            form: 'edit-key-' + item.id,
            cancel: this.closeEdition.bind(this, item.id)
          }) : _react3.default.createElement(
            'div',
            { className: 'input-group' },
            _react3.default.createElement('input', {
              type: 'text',
              className: 'form-control',
              value: item.label || getLabel('keyNbr', { nbr: index + 1 }),
              readOnly: true
            }),
            _react3.default.createElement(
              'span',
              { className: 'input-group-btn' },
              _react3.default.createElement(
                'button',
                {
                  className: 'btn btn-default',
                  onClick: function onClick() {
                    return _this3.setState((0, _immutabilityHelper2.default)(_this3.state, { inEdition: { $push: [item.id] } }));
                  }
                },
                _react3.default.createElement('i', { className: 'fa fa-pencil', 'aria-hidden': 'true' })
              )
            )
          )
        ),
        _react3.default.createElement(
          'div',
          { className: 'col-md-8' },
          _react3.default.createElement(
            'div',
            { className: 'input-group' },
            _react3.default.createElement('input', {
              type: 'text',
              className: 'form-control',
              value: item.key,
              readOnly: true
            }),
            _react3.default.createElement(
              'span',
              { className: 'input-group-btn' },
              _react3.default.createElement(
                _MoreInfo2.default,
                {
                  id: 'key-copy-' + item.id,
                  content: copied.includes(item.id) ? getLabel('copied') : getLabel('copy')
                },
                _react3.default.createElement(
                  _reactCopyToClipboard2.default,
                  { text: item.key, onCopy: function onCopy() {
                      return _this3.handleCopy(item.id);
                    } },
                  _react3.default.createElement(
                    'button',
                    { className: 'btn btn-primary' },
                    _react3.default.createElement('i', { className: 'fa fa-clipboard', 'aria-hidden': 'true' })
                  )
                )
              ),
              _react3.default.createElement(
                'button',
                {
                  className: 'btn btn-default',
                  onClick: function onClick() {
                    return showModal('removeKey', { key: item.key });
                  }
                },
                _react3.default.createElement('i', { className: 'fa fa-trash text-danger', 'aria-hidden': 'true' })
              )
            )
          )
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          keys = _props2.keys,
          create = _props2.create;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'div',
        null,
        keys.map(this.renderKey),
        _react3.default.createElement(
          'a',
          {
            style: { cursor: 'pointer' },
            onClick: function onClick() {
              return create();
            }
          },
          getLabel('generateKey')
        )
      );
    }
  }]);

  return KeysManager;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func,
  lang: _propTypes2.default.string
}, _temp)) || _class));

exports.default = KeysManager;
module.exports = exports['default'];
//# sourceMappingURL=KeysManager.js.map