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

var _dec, _dec2, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reduxForm = require('redux-form');

var _validate = require('../containers/AgendaCreation/validate');

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  CreationSecondStep: {
    displayName: 'CreationSecondStep'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/CreationSecondStep.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var CreationSecondStep = _wrapComponent('CreationSecondStep')((_dec = (0, _reduxForm.reduxForm)({
  form: 'agendaCreation',
  destroyOnUnmount: false,
  validate: _validate.validate,
  asyncValidate: _validate.asyncValidate
}), _dec2 = (0, _reactRedux.connect)(function (state) {
  return {
    title: state.form.agendaCreation.values.title,
    errors: state.form.agendaCreation.syncErrors,
    fields: state.form.agendaCreation.fields
  };
}), _dec(_class = _dec2(_class = (_temp = _class2 = function (_Component) {
  _inherits(CreationSecondStep, _Component);

  function CreationSecondStep() {
    _classCallCheck(this, CreationSecondStep);

    return _possibleConstructorReturn(this, (CreationSecondStep.__proto__ || Object.getPrototypeOf(CreationSecondStep)).apply(this, arguments));
  }

  _createClass(CreationSecondStep, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          previousPage = _props.previousPage,
          handleSubmit = _props.handleSubmit,
          errors = _props.errors,
          fields = _props.fields,
          title = _props.title;
      var getLabel = this.context.getLabel;


      var getError = function getError(fieldname) {
        return (0, _lodash2.default)(fields, fieldname) && (0, _lodash2.default)(fields, fieldname, {}).touched && errors && errors[fieldname];
      };

      return _react3.default.createElement(
        'div',
        null,
        _react3.default.createElement(
          'h2',
          null,
          title
        ),
        _react3.default.createElement(
          'form',
          { onSubmit: handleSubmit },
          _react3.default.createElement(
            'div',
            { className: 'form-group' },
            _react3.default.createElement(
              'div',
              { className: 'radio ' + (getError('settings.contribution.type') ? 'has-error' : '') },
              _react3.default.createElement(
                'p',
                null,
                _react3.default.createElement(
                  'b',
                  null,
                  getLabel('contribType')
                )
              ),
              _react3.default.createElement(
                'label',
                null,
                _react3.default.createElement(_reduxForm.Field, {
                  name: 'settings.contribution.type',
                  component: 'input',
                  type: 'radio',
                  value: '2' }),
                getLabel('contribTypeChoosen')
              ),
              _react3.default.createElement('br', null),
              _react3.default.createElement(
                'label',
                null,
                _react3.default.createElement(_reduxForm.Field, {
                  name: 'settings.contribution.type',
                  component: 'input',
                  type: 'radio',
                  value: '1'
                }),
                getLabel('contribTypeAll')
              )
            )
          ),
          _react3.default.createElement(
            'div',
            { className: 'form-group' },
            _react3.default.createElement(
              'div',
              { className: 'radio ' + (getError('settings.contribution.defaultState') ? 'has-error' : '') },
              _react3.default.createElement(
                'p',
                null,
                _react3.default.createElement(
                  'b',
                  null,
                  getLabel('contribDefaultState')
                )
              ),
              _react3.default.createElement(
                'label',
                null,
                _react3.default.createElement(_reduxForm.Field, {
                  name: 'settings.contribution.defaultState',
                  component: 'input',
                  type: 'radio',
                  value: '2'
                }),
                getLabel('contribDefaultStatePublished'),
                _react3.default.createElement('br', null),
                _react3.default.createElement(
                  'span',
                  { className: 'text-muted' },
                  getLabel('contribDefaultStatePublishedText')
                )
              ),
              _react3.default.createElement('br', null),
              _react3.default.createElement(
                'label',
                null,
                _react3.default.createElement(_reduxForm.Field, {
                  name: 'settings.contribution.defaultState',
                  component: 'input',
                  type: 'radio',
                  value: '0'
                }),
                getLabel('contribDefaultStateUnpublished'),
                _react3.default.createElement('br', null),
                _react3.default.createElement(
                  'span',
                  { className: 'text-muted' },
                  getLabel('contribDefaultStateUnpublishedText')
                )
              )
            )
          ),
          _react3.default.createElement(
            'button',
            { type: 'button', className: 'btn btn-default', onClick: previousPage },
            getLabel('previous')
          ),
          _react3.default.createElement(
            'div',
            { className: 'pull-right' },
            _react3.default.createElement(
              'button',
              { type: 'submit', className: 'btn btn-primary' },
              getLabel('createAgenda')
            )
          )
        )
      );
    }
  }]);

  return CreationSecondStep;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func
}, _temp)) || _class) || _class));

exports.default = CreationSecondStep;
module.exports = exports['default'];