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

var _jsxFileName = 'src/components/Breadcrumb/Breadcrumb.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _recompose = require('recompose');

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  Breadcrumb: {
    displayName: 'Breadcrumb'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/Breadcrumb/Breadcrumb.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var Breadcrumb = _wrapComponent('Breadcrumb')(function (_Component) {
  (0, _inherits3.default)(Breadcrumb, _Component);

  function Breadcrumb() {
    (0, _classCallCheck3.default)(this, Breadcrumb);
    return (0, _possibleConstructorReturn3.default)(this, (Breadcrumb.__proto__ || (0, _getPrototypeOf2.default)(Breadcrumb)).apply(this, arguments));
  }

  (0, _createClass3.default)(Breadcrumb, [{
    key: 'renderParts',
    value: function renderParts() {
      var breadParts = this.props.breadParts;


      if (!breadParts || !breadParts.length) {
        return null;
      }

      return breadParts.map(function (breadPart, i) {
        return _react3.default.createElement(
          _react2.Fragment,
          { key: i, __source: {
              fileName: _jsxFileName,
              lineNumber: 16
            }
          },
          _react3.default.createElement('i', { className: 'fa fa-angle-right', __source: {
              fileName: _jsxFileName,
              lineNumber: 17
            }
          }),
          _react3.default.createElement(
            'span',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 18
              }
            },
            breadPart.component
          )
        );
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          getLabel = _props.getLabel,
          breadParts = _props.breadParts,
          disableFirstPartLink = _props.disableFirstPartLink,
          router = _props.router;


      var noParts = !breadParts || !breadParts.length;

      var homePart = disableFirstPartLink || noParts ? getLabel('inbox') : _react3.default.createElement(
        _.LinkContainer,
        { to: '/', __source: {
            fileName: _jsxFileName,
            lineNumber: 32
          }
        },
        function (path) {
          return _react3.default.createElement(
            'a',
            {
              role: 'button',
              onClick: function onClick() {
                return router.push({ pathname: path, state: { showListAllowed: true } });
              },
              __source: {
                fileName: _jsxFileName,
                lineNumber: 34
              }
            },
            getLabel('inbox')
          );
        }
      );

      return _react3.default.createElement(
        'h3',
        { className: 'inbox-breadcrumbs', __source: {
            fileName: _jsxFileName,
            lineNumber: 45
          }
        },
        homePart,
        this.renderParts()
      );
    }
  }]);
  return Breadcrumb;
}(_react2.Component));

exports.default = (0, _recompose.getContext)({
  getLabel: _propTypes2.default.func,
  router: _propTypes2.default.object
})(Breadcrumb);
module.exports = exports['default'];
//# sourceMappingURL=Breadcrumb.js.map