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

var _reduxForm = require('redux-form');

var _validate = require('../containers/AgendaCreation/validate');

var _inputs = require('../utils/inputs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  CreationFirstStep: {
    displayName: 'CreationFirstStep'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/CreationFirstStep.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var CreationFirstStep = _wrapComponent('CreationFirstStep')((_dec = (0, _reduxForm.reduxForm)({
  form: 'agendaCreation',
  destroyOnUnmount: false,
  validate: _validate.validate,
  asyncValidate: _validate.asyncValidate,
  asyncBlurFields: ['title', 'slug'],
  initialValues: {
    contribution: {
      type: _validate.schema.settings.contribution.type.default.toString(),
      defaultState: _validate.schema.settings.contribution.defaultState.default.toString()
    }
  }
}), _dec(_class = (_temp = _class2 = function (_Component) {
  _inherits(CreationFirstStep, _Component);

  function CreationFirstStep() {
    _classCallCheck(this, CreationFirstStep);

    var _this = _possibleConstructorReturn(this, (CreationFirstStep.__proto__ || Object.getPrototypeOf(CreationFirstStep)).call(this));

    _this.renderInput = _inputs.renderInput.bind(_this);
    _this.renderTextarea = _inputs.renderTextarea.bind(_this);
    _this.renderInputGroup = _inputs.renderInputGroup.bind(_this);
    return _this;
  }

  _createClass(CreationFirstStep, [{
    key: 'render',
    value: function render() {
      var handleSubmit = this.props.handleSubmit;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'div',
        null,
        _react3.default.createElement(
          'h2',
          null,
          getLabel('yourAgenda')
        ),
        _react3.default.createElement(
          'h4',
          { className: 'text-muted' },
          getLabel('subtitle')
        ),
        _react3.default.createElement(
          'form',
          { onSubmit: handleSubmit },
          _react3.default.createElement(_reduxForm.Field, {
            name: 'title',
            component: this.renderInput,
            type: 'text',
            placeholder: getLabel('namePlaceholder'),
            className: 'form-control',
            label: getLabel('name') + ' *',
            max: _validate.schema.title.max
          }),
          _react3.default.createElement(_reduxForm.Field, {
            name: 'description',
            component: this.renderTextarea,
            rows: 6,
            className: 'form-control',
            label: getLabel('description') + ' *',
            max: _validate.schema.description.max
          }),
          _react3.default.createElement(_reduxForm.Field, {
            type: 'text',
            name: 'url',
            component: this.renderInput,
            className: 'form-control',
            placeholder: getLabel('websitePlaceholder'),
            label: getLabel('website')
          }),
          _react3.default.createElement(_reduxForm.Field, {
            type: 'text',
            name: 'slug',
            component: this.renderInputGroup,
            className: 'form-control',
            placeholder: 'URL',
            label: getLabel('personalizedSlug'),
            before: _react3.default.createElement(
              'div',
              { className: 'input-group-addon' },
              'openagenda.com/'
            ),
            errorOnDirty: true,
            spellCheck: false
          }),
          _react3.default.createElement(
            'div',
            { className: 'pull-right' },
            _react3.default.createElement(
              'button',
              { type: 'submit', className: 'btn btn-primary' },
              getLabel('next')
            )
          )
        )
      );
    }
  }]);

  return CreationFirstStep;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _react2.PropTypes.func
}, _temp)) || _class));

exports.default = CreationFirstStep;
module.exports = exports['default'];