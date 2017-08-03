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

var _dec, _dec2, _dec3, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reduxForm = require('redux-form');

var _actions = require('redux-form/lib/actions');

var _imageUpload = require('image-upload');

var _imageUpload2 = _interopRequireDefault(_imageUpload);

var _Modal = require('react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _agenda = require('../../redux/modules/agenda');

var agendaActions = _interopRequireWildcard(_agenda);

var _modals = require('../../redux/modules/modals');

var modalsActions = _interopRequireWildcard(_modals);

var _validate = require('./validate');

var _inputs = require('../../utils/inputs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  ProfileEdition: {
    displayName: 'ProfileEdition'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/ProfileEdition/ProfileEdition.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var displayInputError = function displayInputError(_ref) {
  var dirty = _ref.dirty,
      touched = _ref.touched;
  return touched && dirty;
};

var ProfileEdition = _wrapComponent('ProfileEdition')((_dec = (0, _reactRedux.connect)(function (state) {
  var _state$agenda$data = state.agenda.data,
      uid = _state$agenda$data.uid,
      title = _state$agenda$data.title,
      description = _state$agenda$data.description,
      url = _state$agenda$data.url,
      slug = _state$agenda$data.slug;

  return {
    initialValues: { uid: uid, title: title, description: description, url: url, slug: slug },
    res: state.res,
    agenda: state.agenda.data,
    modals: state.modals,
    imageChanged: state.agenda.imageChanged
  };
}, _extends({}, agendaActions, modalsActions, { onSubmit: agendaActions.edit })), _dec2 = (0, _reduxForm.reduxForm)({
  form: 'profileEdition',
  validate: _validate.validate,
  asyncValidate: _validate.asyncValidate,
  asyncBlurFields: ['slug'],
  enableReinitialize: true
}), _dec3 = (0, _reactRedux.connect)(function () {
  return {};
}, { updateSyncErrors: _actions.updateSyncErrors }), _dec(_class = _dec2(_class = _dec3(_class = (_temp = _class2 = function (_Component) {
  _inherits(ProfileEdition, _Component);

  function ProfileEdition() {
    _classCallCheck(this, ProfileEdition);

    var _this = _possibleConstructorReturn(this, (ProfileEdition.__proto__ || Object.getPrototypeOf(ProfileEdition)).call(this));

    _this.renderInput = _inputs.renderInput.bind(_this);
    _this.renderTextarea = _inputs.renderTextarea.bind(_this);
    _this.renderInputGroup = _inputs.renderInputGroup.bind(_this);
    return _this;
  }

  _createClass(ProfileEdition, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.props.updateSyncErrors('profileEdition');
    }
  }, {
    key: 'renderSubmitBtn',
    value: function renderSubmitBtn() {
      var _props = this.props,
          dirty = _props.dirty,
          submitting = _props.submitting,
          submitSucceeded = _props.submitSucceeded,
          valid = _props.valid,
          imageChanged = _props.imageChanged;
      var getLabel = this.context.getLabel;


      if (!dirty && !imageChanged && submitSucceeded) {
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
        var disabled = dirty && valid || imageChanged && !dirty || imageChanged && dirty && valid;
        return _react3.default.createElement(
          'button',
          _extends({ type: 'submit', className: 'btn btn-primary' }, { disabled: disabled ? undefined : true }),
          getLabel('saveModifications')
        );
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          handleSubmit = _props2.handleSubmit,
          agenda = _props2.agenda,
          modals = _props2.modals,
          imageUploaded = _props2.imageUploaded,
          imageChanged = _props2.imageChanged,
          res = _props2.res,
          showModal = _props2.showModal,
          closeModal = _props2.closeModal,
          remove = _props2.remove;
      var _context = this.context,
          getLabel = _context.getLabel,
          lang = _context.lang;


      return _react3.default.createElement(
        'div',
        { className: 'profile' },
        _react3.default.createElement(
          'h2',
          { className: 'margin-bottom-md' },
          getLabel('agendaProfile')
        ),
        _react3.default.createElement(
          'div',
          { className: 'row' },
          _react3.default.createElement(
            'div',
            { className: 'col-md-7' },
            _react3.default.createElement(_imageUpload2.default, {
              frameName: 'profileAgendaEdition',
              lang: lang,
              value: agenda.image,
              handleUpdate: imageUploaded,
              upload: res.uploadImage.replace(':slug', agenda.slug),
              remove: res.clearImage.replace(':slug', agenda.slug),
              rand: !!imageChanged
            }),
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
                max: _validate.schema.title.max,
                displayError: displayInputError
              }),
              _react3.default.createElement(_reduxForm.Field, {
                name: 'description',
                component: this.renderTextarea,
                rows: 6,
                className: 'form-control',
                label: getLabel('description') + ' *',
                max: _validate.schema.description.max,
                displayError: displayInputError
              }),
              _react3.default.createElement(_reduxForm.Field, {
                type: 'text',
                name: 'url',
                component: this.renderInput,
                className: 'form-control',
                placeholder: getLabel('websitePlaceholder'),
                label: getLabel('website'),
                displayError: displayInputError
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
                displayError: displayInputError,
                spellCheck: false
              }),
              _react3.default.createElement(
                'a',
                { role: 'button', className: 'text-danger', onClick: function onClick() {
                    return showModal('removeAgenda');
                  } },
                getLabel('removeAgenda')
              ),
              _react3.default.createElement(
                'div',
                { className: 'pull-right' },
                this.renderSubmitBtn()
              )
            )
          )
        ),
        _react3.default.createElement(
          _Modal2.default,
          {
            visible: modals['removeAgenda'] ? modals['removeAgenda'].visible : false,
            onClose: function onClose() {
              return closeModal('removeAgenda');
            },
            title: getLabel('removeAgenda')
          },
          _react3.default.createElement(
            'p',
            null,
            getLabel('removeAgendaWarning')
          ),
          _react3.default.createElement(
            'button',
            { className: 'btn btn-primary', onClick: function onClick() {
                return closeModal('removeAgenda');
              } },
            getLabel('close')
          ),
          _react3.default.createElement(
            'button',
            {
              className: 'btn btn-danger pull-right',
              onClick: function onClick() {
                return remove().then(function (_ref2) {
                  var result = _ref2.result;
                  return window.location.href = result.redirectTo || '/';
                });
              }
            },
            getLabel('remove')
          )
        )
      );
    }
  }]);

  return ProfileEdition;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func,
  lang: _propTypes2.default.string
}, _temp)) || _class) || _class) || _class));

exports.default = ProfileEdition;
module.exports = exports['default'];
//# sourceMappingURL=ProfileEdition.js.map