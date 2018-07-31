"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Spinner = require('@openagenda/react-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _Modal = require('@openagenda/react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _LocationSelector = require('@openagenda/agenda-locations/components/build/LocationSelector');

var _LocationSelector2 = _interopRequireDefault(_LocationSelector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (_Component) {
  _inherits(LocationComponent, _Component);

  function LocationComponent(props) {
    _classCallCheck(this, LocationComponent);

    var _this = _possibleConstructorReturn(this, (LocationComponent.__proto__ || Object.getPrototypeOf(LocationComponent)).call(this, props));

    var location = null;

    if (!_this.props.value) {

      _this.state = {
        mode: 'search',
        location: null
      };

      return _possibleConstructorReturn(_this);
    }

    _this.state = {
      initing: true
    };

    _this.loadLocation();

    return _this;
  }

  _createClass(LocationComponent, [{
    key: 'loadLocation',
    value: function loadLocation() {
      var _this2 = this;

      _superagent2.default.get(this.props.field.res.index, { uids: [this.props.value] }).then(function (res) {

        if (!res.body.items.length) {

          _this2.setState({
            initing: false,
            location: null,
            mode: 'search'
          });

          return;
        }

        _this2.setState({
          initing: false,
          location: res.body.items[0],
          mode: 'show'
        });
      });
    }
  }, {
    key: 'onChange',
    value: function onChange(caller, mode, location) {

      this.setState({
        mode: mode,
        location: location
      });

      this.props.onChange(_lodash2.default.get(location, 'uid', null));
    }
  }, {
    key: 'renderSelector',
    value: function renderSelector() {
      var _this3 = this;

      var lang = this.props.lang;
      var res = this.props.field.res;


      return _react2.default.createElement(_LocationSelector2.default, {
        allowCreate: true,
        mode: this.state.mode,
        disableChange: false,
        onChangeMode: this.onChange.bind(this, 'onChangeMode'),
        location: this.state.location,
        lang: this.props.lang,
        res: res,
        onChange: function onChange(location, mode) {
          return _this3.onChange('onChange', mode, location);
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {

      var spinnerCanvasStyle = {
        height: 37,
        position: 'relative'
      };

      if (this.state.initing) {

        return _react2.default.createElement(
          'div',
          { className: 'margin-v-sm text-center', style: spinnerCanvasStyle },
          _react2.default.createElement(_Spinner2.default, { mode: 'inline' })
        );
      }

      if (this.state.mode === 'create') {

        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            { className: 'text-center', style: spinnerCanvasStyle },
            _react2.default.createElement(_Spinner2.default, { mode: 'inline' })
          ),
          _react2.default.createElement(
            _Modal2.default,
            {
              classNames: { overlay: 'popup-overlay big' }
            },
            this.renderSelector()
          )
        );
      }

      //const labels = flattenLabels( timingsLabels, lang );

      return _react2.default.createElement(
        'div',
        { className: 'margin-v-sm' },
        this.renderSelector()
      );
    }
  }]);

  return LocationComponent;
}(_react.Component);
//# sourceMappingURL=Location.js.map