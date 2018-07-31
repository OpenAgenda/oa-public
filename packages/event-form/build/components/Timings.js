"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactTimingsPicker = require('react-timings-picker');

var _reactTimingsPicker2 = _interopRequireDefault(_reactTimingsPicker);

var _timings = require('@openagenda/labels/event/timings');

var _timings2 = _interopRequireDefault(_timings);

var _flatten = require('@openagenda/labels/flatten');

var _flatten2 = _interopRequireDefault(_flatten);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (_Component) {
  _inherits(TimingsComponent, _Component);

  function TimingsComponent() {
    _classCallCheck(this, TimingsComponent);

    return _possibleConstructorReturn(this, (TimingsComponent.__proto__ || Object.getPrototypeOf(TimingsComponent)).apply(this, arguments));
  }

  _createClass(TimingsComponent, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var lang = this.props.lang;


      var labels = (0, _flatten2.default)(_timings2.default, lang);

      return _react2.default.createElement(_reactTimingsPicker2.default, {
        info: labels.noTiming,
        lang: { fr: 'fr-FR', en: 'en-US' }[lang],
        startTime: '7:00',
        timings: (this.props.value || []).map(function (t) {
          return { start: t.begin, end: t.end };
        }),
        endTime: '7:00',
        activeDays: [],
        weekStartDay: 1,
        defaultDisplayWeekDay: new Date(),
        onTimingsChange: function onTimingsChange(timings) {
          return _this2.props.onChange(timings.map(function (t) {
            return { begin: t.start, end: t.end };
          }));
        },
        readOnly: false,
        additionalLanguages: [],
        timingStep: 30
      });
    }
  }]);

  return TimingsComponent;
}(_react.Component);
//# sourceMappingURL=Timings.js.map