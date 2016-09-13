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

var _reactRedux = require('react-redux');

var _components2 = require('../../components');

var _agenda = require('../../redux/modules/agenda');

var agendaActions = _interopRequireWildcard(_agenda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  AgendaCreation: {
    displayName: 'AgendaCreation'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/AgendaCreation/AgendaCreation.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var AgendaCreation = _wrapComponent('AgendaCreation')((_dec = (0, _reactRedux.connect)(function () {
  return {};
}, _extends({}, agendaActions)), _dec(_class = (_temp = _class2 = function (_Component) {
  _inherits(AgendaCreation, _Component);

  function AgendaCreation(props) {
    _classCallCheck(this, AgendaCreation);

    var _this = _possibleConstructorReturn(this, (AgendaCreation.__proto__ || Object.getPrototypeOf(AgendaCreation)).call(this, props));

    _this.nextPage = _this.nextPage.bind(_this);
    _this.previousPage = _this.previousPage.bind(_this);
    _this.handleSubmit = _this.handleSubmit.bind(_this);
    _this.state = {
      page: 1
    };
    return _this;
  }

  _createClass(AgendaCreation, [{
    key: 'nextPage',
    value: function nextPage() {
      this.setState({ page: this.state.page + 1 });
    }
  }, {
    key: 'previousPage',
    value: function previousPage() {
      this.setState({ page: this.state.page - 1 });
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(values) {
      console.log(values);
      this.props.create(values);
    }
  }, {
    key: 'render',
    value: function render() {
      var page = this.state.page;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'div',
        { className: 'row' },
        _react3.default.createElement(
          'div',
          { className: 'col-md-offset-3 col-md-6' },
          _react3.default.createElement(
            'div',
            { className: 'top-margined wsq' },
            _react3.default.createElement(
              'div',
              { className: 'content clearfix' },
              _react3.default.createElement(
                'div',
                { className: 'stepper-container' },
                _react3.default.createElement(
                  'div',
                  { className: 'stepper' },
                  _react3.default.createElement(
                    'div',
                    { className: 'step ' + (page == 1 ? 'active' : 'passed') },
                    getLabel('description')
                  ),
                  _react3.default.createElement(
                    'div',
                    { className: 'step ' + (page == 2 && 'active') },
                    getLabel('parameters')
                  )
                )
              ),
              page === 1 && _react3.default.createElement(_components2.CreationFirstStep, { onSubmit: this.nextPage }),
              page === 2 && _react3.default.createElement(_components2.CreationSecondStep, { previousPage: this.previousPage, onSubmit: this.handleSubmit })
            )
          )
        )
      );
    }
  }]);

  return AgendaCreation;
}(_react2.Component), _class2.propTypes = {
  create: _react2.PropTypes.func
}, _class2.contextTypes = {
  getLabel: _react2.PropTypes.func
}, _temp)) || _class));

exports.default = AgendaCreation;
module.exports = exports['default'];