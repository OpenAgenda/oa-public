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

var _dec, _class;

var _components2 = require('../components');

var _reduxForm = require('redux-form');

var _schema = require('validators/schema');

var _schema2 = _interopRequireDefault(_schema);

var _validators = require('validators');

var _validators2 = _interopRequireDefault(_validators);

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
  filename: 'react/src/containers/AgendaCreation.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

_schema2.default.register({
  text: _validators2.default.text
});

var AgendaCreation = _wrapComponent('AgendaCreation')((_dec = (0, _reduxForm.reduxForm)({
  form: 'agendaCreation'
}), _dec(_class = function (_Component) {
  _inherits(AgendaCreation, _Component);

  function AgendaCreation(props) {
    _classCallCheck(this, AgendaCreation);

    var _this = _possibleConstructorReturn(this, (AgendaCreation.__proto__ || Object.getPrototypeOf(AgendaCreation)).call(this, props));

    _this.nextPage = _this.nextPage.bind(_this);
    _this.previousPage = _this.previousPage.bind(_this);
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
    key: 'render',
    value: function render() {
      var handleSubmit = this.props.handleSubmit;
      var page = this.state.page;


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
                    'Description'
                  ),
                  _react3.default.createElement(
                    'div',
                    { className: 'step ' + (page == 2 && 'active') },
                    'Paramètres'
                  )
                )
              ),
              page === 1 && _react3.default.createElement(_components2.CreationFirstStep, { onSubmit: this.nextPage }),
              page === 2 && _react3.default.createElement(_components2.CreationSecondStep, { previousPage: this.previousPage, onSubmit: handleSubmit })
            )
          )
        )
      );
    }
  }]);

  return AgendaCreation;
}(_react2.Component)) || _class));

exports.default = AgendaCreation;
module.exports = exports['default'];