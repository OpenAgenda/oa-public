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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _dec3, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reduxForm = require('redux-form');

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _agenda = require('../../redux/modules/agenda');

var agendaActions = _interopRequireWildcard(_agenda);

var _inputs = require('../../utils/inputs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  ContributionEdition: {
    displayName: 'ContributionEdition'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/ContributionEdition/ContributionEdition.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var ContributionEdition = _wrapComponent('ContributionEdition')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    initialValues: { settings: { contribution: state.agenda.data.settings.contribution } }
  };
}, { onSubmit: agendaActions.edit }), _dec2 = (0, _reduxForm.reduxForm)({
  form: 'contributionEdition',
  enableReinitialize: true
}), _dec3 = (0, _reactRedux.connect)(function (state) {
  return {
    errors: state.form.contributionEdition.syncErrors,
    fields: state.form.contributionEdition.fields
  };
}), _dec(_class = _dec2(_class = _dec3(_class = (_temp = _class2 = function (_Component) {
  _inherits(ContributionEdition, _Component);

  function ContributionEdition() {
    _classCallCheck(this, ContributionEdition);

    var _this = _possibleConstructorReturn(this, (ContributionEdition.__proto__ || Object.getPrototypeOf(ContributionEdition)).call(this));

    _this.renderTextarea = _inputs.renderTextarea.bind(_this);
    _this.renderMarkdownInput = _inputs.renderMarkdownInput.bind(_this);
    return _this;
  }

  _createClass(ContributionEdition, [{
    key: 'renderSubmitBtn',
    value: function renderSubmitBtn() {
      var _props = this.props,
          dirty = _props.dirty,
          submitting = _props.submitting,
          submitSucceeded = _props.submitSucceeded,
          valid = _props.valid;
      var getLabel = this.context.getLabel;


      if (!dirty && submitSucceeded) {
        return _react3.default.createElement(
          'button',
          { type: 'submit', className: 'btn btn-success', disabled: true },
          getLabel('saved')
        );
      } else if (submitting) {
        return _react3.default.createElement(
          'button',
          { type: 'submit', className: 'btn btn-primary', disabled: true },
          getLabel('saving')
        );
      } else {
        return _react3.default.createElement(
          'button',
          _extends({ type: 'submit', className: 'btn btn-primary' }, { disabled: dirty && valid ? undefined : true }),
          getLabel('saveModifications')
        );
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          handleSubmit = _props2.handleSubmit,
          fields = _props2.fields,
          errors = _props2.errors;
      var getLabel = this.context.getLabel;


      var getError = function getError(fieldname) {
        return (0, _lodash2.default)(fields, fieldname) && (0, _lodash2.default)(fields, fieldname, {}).touched && errors && errors[fieldname];
      };

      return _react3.default.createElement(
        'div',
        { className: 'contribution' },
        _react3.default.createElement(
          'h2',
          { className: 'margin-bottom-md' },
          getLabel('contribution')
        ),
        _react3.default.createElement(
          'div',
          { className: 'row' },
          _react3.default.createElement(
            'div',
            { className: 'col-md-7' },
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
                      value: '2',
                      format: function format(v) {
                        return v.toString();
                      },
                      parse: function parse(value) {
                        return value === undefined ? undefined : parseInt(value);
                      }
                    }),
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
                      value: '1',
                      format: function format(v) {
                        return v.toString();
                      },
                      parse: function parse(value) {
                        return value === undefined ? undefined : parseInt(value);
                      }
                    }),
                    getLabel('contribTypeAll')
                  )
                )
              ),
              _react3.default.createElement(_reduxForm.Field, {
                name: 'settings.contribution.message',
                component: this.renderMarkdownInput,
                label: getLabel('consigne'),
                subLabel: _react3.default.createElement(
                  'p',
                  null,
                  getLabel('consigneSubLabel')
                ),
                lang: this.context.lang
              }),
              _react3.default.createElement(
                'div',
                { className: 'form-group' },
                _react3.default.createElement(
                  'div',
                  { className: 'radio ' + (getError('settings.contribution.useFields') ? 'has-error' : '') },
                  _react3.default.createElement(
                    'p',
                    null,
                    _react3.default.createElement(
                      'b',
                      null,
                      getLabel('contribUseFields')
                    )
                  ),
                  _react3.default.createElement(
                    'label',
                    null,
                    _react3.default.createElement(_reduxForm.Field, {
                      name: 'settings.contribution.useFields',
                      component: 'input',
                      type: 'radio',
                      value: '1',
                      format: function format(v) {
                        return v ? '1' : '0';
                      },
                      parse: function parse(v) {
                        return Boolean(parseInt(v));
                      }
                    }),
                    getLabel('yes')
                  ),
                  _react3.default.createElement('br', null),
                  _react3.default.createElement(
                    'label',
                    null,
                    _react3.default.createElement(_reduxForm.Field, {
                      name: 'settings.contribution.useFields',
                      component: 'input',
                      type: 'radio',
                      value: '0',
                      format: function format(v) {
                        return v ? '1' : '0';
                      },
                      parse: function parse(v) {
                        return Boolean(parseInt(v));
                      }
                    }),
                    getLabel('no')
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
                      value: '2',
                      format: function format(v) {
                        return v.toString();
                      },
                      parse: function parse(value) {
                        return value === undefined ? undefined : parseInt(value);
                      }
                    }),
                    getLabel('contribDefaultStatePublished'),
                    ' ',
                    _react3.default.createElement(
                      'span',
                      { className: 'text-muted' },
                      '(',
                      getLabel('contribDefaultStatePublishedText'),
                      ')'
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
                      value: '0',
                      format: function format(v) {
                        return v.toString();
                      },
                      parse: function parse(value) {
                        return value === undefined ? undefined : parseInt(value);
                      }
                    }),
                    getLabel('contribDefaultStateUnpublished'),
                    ' ',
                    _react3.default.createElement(
                      'span',
                      { className: 'text-muted' },
                      '(',
                      getLabel('contribDefaultStateUnpublishedText'),
                      ')'
                    )
                  )
                )
              ),
              _react3.default.createElement(
                'div',
                { className: 'text-right' },
                this.renderSubmitBtn()
              )
            )
          )
        )
      );
    }
  }]);

  return ContributionEdition;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func,
  lang: _propTypes2.default.string
}, _temp)) || _class) || _class) || _class));

exports.default = ContributionEdition;
module.exports = exports['default'];