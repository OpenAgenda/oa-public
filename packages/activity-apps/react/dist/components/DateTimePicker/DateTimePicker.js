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

var _class, _temp;

var _reactBootstrapDatetimerangepicker = require('react-bootstrap-datetimerangepicker');

var _reactBootstrapDatetimerangepicker2 = _interopRequireDefault(_reactBootstrapDatetimerangepicker);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _reactBootstrap = require('react-bootstrap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  DateTimePicker: {
    displayName: 'DateTimePicker'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/DateTimePicker/DateTimePicker.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var DateTimePicker = _wrapComponent('DateTimePicker')((_temp = _class = function (_Component) {
  _inherits(DateTimePicker, _Component);

  function DateTimePicker(props) {
    _classCallCheck(this, DateTimePicker);

    var _this = _possibleConstructorReturn(this, (DateTimePicker.__proto__ || Object.getPrototypeOf(DateTimePicker)).call(this, props));

    _this.state = {
      startDate: (_this.props.startValue || (0, _moment2.default)()).subtract(29, 'days'),
      endDate: _this.props.endValue || (0, _moment2.default)(),
      ranges: {
        'Aujourd\'hui': [(0, _moment2.default)().startOf('day'), (0, _moment2.default)()],
        'Hier': [(0, _moment2.default)().subtract(1, 'days').startOf('day'), (0, _moment2.default)().subtract(1, 'days').endOf('day')],
        '7 derniers jours': [(0, _moment2.default)().subtract(6, 'days').startOf('day'), (0, _moment2.default)()],
        '30 derniers jours': [(0, _moment2.default)().subtract(29, 'days').startOf('day'), (0, _moment2.default)()],
        'Ce mois-ci': [(0, _moment2.default)().startOf('month').startOf('day'), (0, _moment2.default)().endOf('month')],
        'Le mois dernier': [(0, _moment2.default)().subtract(1, 'month').startOf('month').startOf('day'), (0, _moment2.default)().subtract(1, 'month').endOf('month')]
      }
    };

    _this.handleEvent = _this.handleEvent.bind(_this);
    return _this;
  }

  _createClass(DateTimePicker, [{
    key: 'handleEvent',
    value: function handleEvent(event, picker) {
      var handleEvent = this.props.handleEvent;


      if (handleEvent) handleEvent(event, picker);

      this.setState({
        startDate: picker.startDate,
        endDate: picker.endDate
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          startValue = _props.startValue,
          endValue = _props.endValue,
          ranges = _props.ranges;


      var start = startValue && (startValue || this.state.startDate).format('LLL');
      var end = endValue && (endValue || this.state.endDate).format('LLL');
      var label = start === end ? start : start + ' - ' + end;

      var buttonStyle = { width: '100%' };

      return _react3.default.createElement(
        _reactBootstrapDatetimerangepicker2.default,
        {
          timePicker: true,
          timePicker24Hour: true,
          timePickerSeconds: true,
          locale: {
            applyLabel: 'Appliquer',
            cancelLabel: 'Annuler',
            customRangeLabel: 'Période définie'
          },
          startDate: startValue,
          endDate: endValue,
          ranges: ranges || this.state.ranges,
          onApply: this.handleEvent
        },
        _react3.default.createElement(
          _reactBootstrap.Button,
          { className: 'selected-date-range-btn', style: buttonStyle },
          _react3.default.createElement(
            'div',
            { className: 'pull-left' },
            _react3.default.createElement('i', { className: 'fa fa-calendar' }),
            ' ',
            _react3.default.createElement(
              'span',
              null,
              label
            )
          ),
          _react3.default.createElement(
            'div',
            { className: 'pull-right' },
            _react3.default.createElement('i', { className: 'fa fa-angle-down' })
          )
        )
      );
    }
  }]);

  return DateTimePicker;
}(_react2.Component), _class.PropTypes = {
  handleEvent: _react2.PropTypes.func,
  startValue: _react2.PropTypes.oneOfType([_react2.PropTypes.string, _react2.PropTypes.object]),
  endValue: _react2.PropTypes.oneOfType([_react2.PropTypes.string, _react2.PropTypes.object])
}, _temp));

exports.default = DateTimePicker;
module.exports = exports['default'];