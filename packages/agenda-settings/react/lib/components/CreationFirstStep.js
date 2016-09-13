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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reduxForm = require('redux-form');

var _validate = require('../containers/AgendaCreation/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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

var ucfirst = function ucfirst(value) {
  return value[0].toUpperCase() + value.slice(1);
};

var renderField = function renderField(_ref) {
  var content = _ref.content;
  var _ref$input = _ref.input;
  var name = _ref$input.name;
  var value = _ref$input.value;
  var label = _ref.label;
  var max = _ref.max;
  var errorOnDirty = _ref.errorOnDirty;
  var _ref$meta = _ref.meta;
  var touched = _ref$meta.touched;
  var error = _ref$meta.error;
  var dirty = _ref$meta.dirty;

  var displayError = errorOnDirty ? dirty : touched;
  return _react3.default.createElement(
    'div',
    { className: 'form-group ' + (displayError && error ? 'has-error has-feedback' : '') },
    label && _react3.default.createElement(
      'label',
      { htmlFor: name },
      label
    ),
    content,
    displayError && error && _react3.default.createElement(
      'span',
      { className: 'form-control-feedback' },
      _react3.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' })
    ),
    displayError && error && _react3.default.createElement(
      'div',
      { className: 'text-danger ' + (max && 'pull-left' || '') },
      ucfirst(error)
    ),
    max && _react3.default.createElement(
      'div',
      { className: 'text-right ' + (max - value.length < 0 && 'text-danger' || '') },
      max - value.length
    )
  );
};

var renderInput = function renderInput(_ref2) {
  var type = _ref2.type;
  var placeholder = _ref2.placeholder;
  var className = _ref2.className;

  var props = _objectWithoutProperties(_ref2, ['type', 'placeholder', 'className']);

  var content = _react3.default.createElement('input', _extends({}, props.input, { type: type, placeholder: placeholder, className: className }));
  return renderField(_extends({ content: content }, props));
};

var renderTextarea = function renderTextarea(_ref3) {
  var placeholder = _ref3.placeholder;
  var className = _ref3.className;
  var rows = _ref3.rows;
  var cols = _ref3.cols;

  var props = _objectWithoutProperties(_ref3, ['placeholder', 'className', 'rows', 'cols']);

  var content = _react3.default.createElement(
    'div',
    null,
    _react3.default.createElement('textarea', _extends({}, props.input, { placeholder: placeholder, className: className, rows: rows, cols: cols }))
  );
  return renderField(_extends({ content: content }, props));
};

var renderInputGroup = function renderInputGroup(_ref4) {
  var type = _ref4.type;
  var placeholder = _ref4.placeholder;
  var className = _ref4.className;
  var before = _ref4.before;
  var after = _ref4.after;

  var props = _objectWithoutProperties(_ref4, ['type', 'placeholder', 'className', 'before', 'after']);

  var content = _react3.default.createElement(
    'div',
    { className: 'input-group' },
    before,
    _react3.default.createElement('input', _extends({}, props.input, { type: type, placeholder: placeholder, className: className })),
    after
  );
  return renderField(_extends({ content: content }, props));
};

var CreationFirstStep = _wrapComponent('CreationFirstStep')((_dec = (0, _reduxForm.reduxForm)({
  form: 'agendaCreation',
  destroyOnUnmount: false,
  validate: _validate.validate,
  asyncValidate: _validate.asyncValidate,
  asyncBlurFields: ['title', 'slug'],
  initialValues: {
    contribution: {
      type: _validate.schema.contribution.type.default.toString(),
      defaultState: _validate.schema.contribution.defaultState.default.toString()
    }
  }
}), _dec(_class = function (_Component) {
  _inherits(CreationFirstStep, _Component);

  function CreationFirstStep() {
    _classCallCheck(this, CreationFirstStep);

    return _possibleConstructorReturn(this, (CreationFirstStep.__proto__ || Object.getPrototypeOf(CreationFirstStep)).apply(this, arguments));
  }

  _createClass(CreationFirstStep, [{
    key: 'render',
    value: function render() {
      var handleSubmit = this.props.handleSubmit;


      return _react3.default.createElement(
        'div',
        null,
        _react3.default.createElement(
          'h2',
          null,
          'Votre agenda'
        ),
        _react3.default.createElement(
          'h4',
          { className: 'text-muted' },
          'Un agenda est une liste d\'événements'
        ),
        _react3.default.createElement(
          'form',
          { onSubmit: handleSubmit },
          _react3.default.createElement(_reduxForm.Field, {
            name: 'title',
            component: renderInput,
            type: 'text',
            placeholder: 'Mon organisation, mon festival, ma ville, autre',
            className: 'form-control',
            label: 'Nom *',
            max: _validate.schema.title.max
          }),
          _react3.default.createElement(_reduxForm.Field, {
            name: 'description',
            component: renderTextarea,
            rows: 6,
            className: 'form-control',
            label: 'Description *',
            max: _validate.schema.description.max
          }),
          _react3.default.createElement(_reduxForm.Field, {
            type: 'text',
            name: 'url',
            component: renderInput,
            className: 'form-control',
            placeholder: 'http://monsite.com',
            label: 'Site web'
          }),
          _react3.default.createElement(_reduxForm.Field, {
            type: 'text',
            name: 'slug',
            component: renderInputGroup,
            className: 'form-control',
            placeholder: 'URL',
            label: 'Adresse web personnalisée',
            before: _react3.default.createElement(
              'div',
              { className: 'input-group-addon' },
              'openagenda.com/'
            ),
            errorOnDirty: true
          }),
          _react3.default.createElement(
            'div',
            { className: 'pull-right' },
            _react3.default.createElement(
              'button',
              { type: 'submit', className: 'btn btn-primary' },
              'Suivant'
            )
          )
        )
      );
    }
  }]);

  return CreationFirstStep;
}(_react2.Component)) || _class));

exports.default = CreationFirstStep;
module.exports = exports['default'];