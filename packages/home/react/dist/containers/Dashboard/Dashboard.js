"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redboxReact2 = require("redbox-react");

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require("react");

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require("react-transform-catch-errors");

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  Dashboard: {
    displayName: "Dashboard"
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: "react/src/containers/Dashboard/Dashboard.js",
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var Dashboard = _wrapComponent("Dashboard")(function (_Component) {
  _inherits(Dashboard, _Component);

  function Dashboard() {
    _classCallCheck(this, Dashboard);

    return _possibleConstructorReturn(this, (Dashboard.__proto__ || Object.getPrototypeOf(Dashboard)).apply(this, arguments));
  }

  _createClass(Dashboard, [{
    key: "render",
    value: function render() {
      return _react3.default.createElement(
        "div",
        null,
        _react3.default.createElement(
          "h2",
          { className: "hidden-xs" },
          "Mes agendas"
        ),
        _react3.default.createElement(
          "form",
          null,
          _react3.default.createElement(
            "div",
            { className: "form-group search" },
            _react3.default.createElement("input", { type: "text", className: "form-control", placeholder: "Rechercher un agenda" }),
            _react3.default.createElement(
              "button",
              { type: "submit", className: "btn" },
              _react3.default.createElement("i", { className: "fa fa-search", "aria-hidden": "true" })
            )
          )
        ),
        _react3.default.createElement("div", { className: "row" })
      );
    }
  }]);

  return Dashboard;
}(_react2.Component));

exports.default = Dashboard;
module.exports = exports["default"];