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

var _dec, _dec2, _class;

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
}), _dec(_class = _dec2(_class = function (_Component) {
  _inherits(CreationSecondStep, _Component);

  function CreationSecondStep() {
    _classCallCheck(this, CreationSecondStep);

    return _possibleConstructorReturn(this, (CreationSecondStep.__proto__ || Object.getPrototypeOf(CreationSecondStep)).apply(this, arguments));
  }

  _createClass(CreationSecondStep, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var previousPage = _props.previousPage;
      var handleSubmit = _props.handleSubmit;
      var errors = _props.errors;
      var fields = _props.fields;
      var title = _props.title;


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
              { className: 'radio ' + (getError('contribution.type') ? 'has-error' : '') },
              _react3.default.createElement(
                'p',
                null,
                _react3.default.createElement(
                  'b',
                  null,
                  'Qui peut ajouter des événements à cet agenda ?'
                )
              ),
              _react3.default.createElement(
                'label',
                null,
                _react3.default.createElement(_reduxForm.Field, { name: 'contribution.type', component: 'input', type: 'radio', value: '0' }),
                'Seulement des personnes choisies et moi'
              ),
              _react3.default.createElement('br', null),
              _react3.default.createElement(
                'label',
                null,
                _react3.default.createElement(_reduxForm.Field, { name: 'contribution.type', component: 'input', type: 'radio', value: '1' }),
                'Tout le monde'
              )
            )
          ),
          _react3.default.createElement(
            'div',
            { className: 'form-group' },
            _react3.default.createElement(
              'div',
              { className: 'radio ' + (getError('contribution.defaultState') ? 'has-error' : '') },
              _react3.default.createElement(
                'p',
                null,
                _react3.default.createElement(
                  'b',
                  null,
                  'Statut par défaut des événements'
                )
              ),
              _react3.default.createElement(
                'label',
                null,
                _react3.default.createElement(_reduxForm.Field, {
                  name: 'contribution.defaultState',
                  component: 'input',
                  type: 'radio',
                  value: '2'
                }),
                'Publiés',
                _react3.default.createElement(
                  'span',
                  { className: 'text-muted' },
                  '(vous pouvez modifier les événements ensuite)'
                )
              ),
              _react3.default.createElement('br', null),
              _react3.default.createElement(
                'label',
                null,
                _react3.default.createElement(_reduxForm.Field, {
                  name: 'contribution.defaultState',
                  component: 'input',
                  type: 'radio',
                  value: '0'
                }),
                'Non-publiés',
                _react3.default.createElement(
                  'span',
                  { className: 'text-muted' },
                  '(les événements ne deviennent publics qu\'après votre validation)'
                )
              )
            )
          ),
          _react3.default.createElement(
            'button',
            { type: 'button', className: 'btn btn-default', onClick: previousPage },
            'Précédent'
          ),
          _react3.default.createElement(
            'div',
            { className: 'pull-right' },
            _react3.default.createElement(
              'button',
              { type: 'submit', className: 'btn btn-primary' },
              'Créer l\'agenda'
            )
          )
        )
      );
    }
  }]);

  return CreationSecondStep;
}(_react2.Component)) || _class) || _class));

exports.default = CreationSecondStep;
module.exports = exports['default'];