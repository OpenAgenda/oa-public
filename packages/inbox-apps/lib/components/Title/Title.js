'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = 'src/components/Title/Title.js';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _recompose = require('recompose');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Title = function Title(_ref) {
  var Component = _ref.Component,
      tab = _ref.tab,
      getLabel = _ref.getLabel,
      className = _ref.className;

  return _react2.default.createElement(
    Component,
    { key: 'title', className: className, __source: {
        fileName: _jsxFileName,
        lineNumber: 7
      }
    },
    getLabel('inbox'),
    tab === 'conversation' && _react2.default.createElement(
      'small',
      { className: 'margin-left-sm', __source: {
          fileName: _jsxFileName,
          lineNumber: 9
        }
      },
      getLabel('conversation')
    ),
    tab === 'createConversation' && _react2.default.createElement(
      'small',
      { className: 'margin-left-sm', __source: {
          fileName: _jsxFileName,
          lineNumber: 10
        }
      },
      getLabel('newConversation')
    )
  );
};

var enhance = (0, _recompose.compose)((0, _recompose.defaultProps)({
  Component: 'h2'
}), (0, _recompose.getContext)({
  getLabel: _propTypes2.default.func
}));

exports.default = enhance(Title);
module.exports = exports['default'];
//# sourceMappingURL=Title.js.map