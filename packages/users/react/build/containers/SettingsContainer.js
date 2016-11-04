"use strict";

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  SettingsContainer: {
    displayName: 'SettingsContainer'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/SettingsContainer.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var React = require('react'),
    _require = require('redux'),
    bindActionCreators = _require.bindActionCreators,
    _require2 = require('react-redux'),
    connect = _require2.connect,
    _require3 = require('react-router-redux'),
    routerActions = _require3.routerActions,
    _require4 = require('redux-form'),
    changeFieldValue = _require4.change,
    resetForm = _require4.reset,
    get = require('utils/get'),
    request = require('superagent'),
    actions = require('../actions'),
    Spinner = require('react-form-components/build/Spinner'),
    ProfileSettings = require('../components/ProfileSettings'),
    ImageSettings = require('../components/ImageSettings'),
    EmailSettings = require('../components/EmailSettings'),
    PasswordSettings = require('../components/PasswordSettings'),
    ApiKeySettings = require('../components/ApiKeySettings'),
    Modal = require('react-components/build/Modal');

var SettingsContainer = _wrapComponent('SettingsContainer')(React.createClass({

  displayName: 'SettingsContainer',

  contextTypes: {
    getLabels: React.PropTypes.func
  },

  componentWillMount: function componentWillMount() {
    var _this = this;

    this.props.getMe().then(function () {
      return _this.props.setLoading(false);
    }, function () {
      return _this.props.setLoading(false);
    });
  },
  render: function render() {
    var getLabels = this.context.getLabels;
    var _props = this.props,
        loading = _props.loading,
        user = _props.user,
        activeTab = _props.route.activeTab,
        routerActions = _props.routerActions,
        getUrl = _props.getUrl,
        updateUser = _props.updateUser,
        changeEmail = _props.changeEmail,
        changePassword = _props.changePassword,
        deleteAccount = _props.deleteAccount,
        generateApiKey = _props.generateApiKey,
        displayModal = _props.displayModal,
        modal = _props.modal,
        _props$successMessage = _props.successMessagesDisplayed,
        profileMessageDisplayed = _props$successMessage.updateProfile,
        emailMessageDisplayed = _props$successMessage.changeEmail,
        passwordMessageDisplayed = _props$successMessage.changePassword,
        onChangeProfileImage = _props.onChangeProfileImage;


    return React.createElement(
      'div',
      { className: 'table-responsive', style: { padding: '15px 0', position: 'relative' } },
      loading ? React.createElement(Spinner, null) : React.createElement(
        'table',
        { className: 'table table-hover' },
        React.createElement(
          'tbody',
          null,
          React.createElement(ProfileSettings, { activeTab: activeTab == 'profile', onSubmit: updateUser,
            deleteAccount: deleteAccount, displayModal: displayModal,
            successMessageDisplayed: profileMessageDisplayed }),
          React.createElement(ImageSettings, { activeTab: activeTab == 'image', routerActions: routerActions,
            onUpdate: onChangeProfileImage, uploadImageRes: getUrl('uploadProfileImageRes'),
            removeImageRes: getUrl('removeProfileImageRes'), image: user && user.image || '' }),
          React.createElement(EmailSettings, { activeTab: activeTab == 'email', onSubmit: changeEmail,
            successMessageDisplayed: emailMessageDisplayed }),
          React.createElement(PasswordSettings, { activeTab: activeTab == 'password', onSubmit: changePassword,
            successMessageDisplayed: passwordMessageDisplayed }),
          React.createElement(ApiKeySettings, { activeTab: activeTab == 'apiKey', generateApiKey: generateApiKey,
            displayModal: displayModal })
        )
      ),
      React.createElement(
        Modal,
        { visible: modal.visible || false, onClose: function onClose() {
            return displayModal({ visible: false });
          },
          title: modal.title || '' },
        React.createElement(
          'div',
          { className: 'text-center' },
          modal.content || '',
          React.createElement(
            'button',
            {
              className: modal.buttonClass || 'btn btn-danger',
              onClick: function onClick() {
                if (modal.action) modal.action();displayModal({ visible: false });
              } },
            modal.actionText || ''
          )
        )
      )
    );
  }
}));

function mapStateToProps(_ref) {
  var _ref$app = _ref.app,
      appSettings = _ref$app.appSettings,
      loading = _ref$app.loading,
      userSettings = _ref.userSettings;


  return _extends({
    loading: loading,
    appSettings: appSettings
  }, userSettings);
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  var dispatch = dispatchProps.dispatch;
  var appSettings = stateProps.appSettings;


  var mapDispatchToProps = {
    setLoading: setLoading,
    getUrl: getUrl,
    routerActions: bindActionCreators(routerActions, dispatch),
    getMe: getMe,
    updateUser: updateUser,
    onChangeProfileImage: onChangeProfileImage,
    changeEmail: changeEmail,
    changePassword: changePassword,
    generateApiKey: generateApiKey,
    displayModal: displayModal,
    deleteAccount: deleteAccount
  };

  return Object.assign({}, ownProps, stateProps, mapDispatchToProps);

  function setLoading(value) {

    dispatch(actions.setLoading(value));
  }

  function getMe() {
    dispatch(actions.getMe('request'));

    return new Promise(function (resolve, reject) {

      get(getUrl('getMe'), function (err, result) {
        if (err) {
          reject(err);
        } else {
          dispatch(actions.getMe('response', result));
          if (result.user) {
            dispatch(changeFieldValue('profileSettings', 'full_name', result.user.full_name));
            dispatch(changeFieldValue('profileSettings', 'culture', result.user.culture));
            dispatch(changeFieldValue('emailSettings', 'email', result.user.email));
            dispatch(changeFieldValue('apiKeySettings', 'apiKey', result.user.api_key));
            dispatch(changeFieldValue('apiKeySettings', 'apiSecret', result.user.api_secret));
            resolve(result.user);
          } else {
            reject();
          }
        }
      });
    });
  }

  function updateUser(_ref2) {
    var full_name = _ref2.full_name,
        culture = _ref2.culture;

    dispatch(actions.updateUser('request'));

    return new Promise(function (resolve, reject) {
      get(getUrl('updateProfile'), { full_name: full_name, culture: culture }, function (err, result) {
        if (!err) {
          var errors = getFormFirstErrors(result.errors);

          if (Object.keys(errors).length) {
            reject(errors);
          } else {
            dispatch(actions.displayMessage('updateProfile', true));
            setTimeout(function () {
              return dispatch(actions.displayMessage('updateProfile', false));
            }, 2000);
            resolve();
          }

          if (result.success) {
            dispatch(actions.updateUser('response', result));
          }
        }
      });
    });
  }

  function onChangeProfileImage(image, err) {

    dispatch(actions.updateUser('response', { image: image }));
  }

  function changeEmail(_ref3) {
    var email = _ref3.email,
        password = _ref3.password;

    dispatch(actions.changeEmail('request'));

    return new Promise(function (resolve, reject) {

      get(getUrl('changeEmail'), { email: email, password: password }, function (err, result) {
        if (!err) {
          var errors = getFormFirstErrors(result.errors);

          if (Object.keys(errors).length) {
            reject(errors);
          } else {
            dispatch(actions.displayMessage('changeEmail', true));
            setTimeout(function () {
              return dispatch(actions.displayMessage('changeEmail', false));
            }, 2000);
            resolve();
          }

          dispatch(actions.changeEmail('response', result));
        }
      });
    }).then(function () {
      dispatch(resetForm('emailSettings'));
    });
  }

  function changePassword(_ref4) {
    var old_password = _ref4.old_password,
        new_password = _ref4.new_password,
        confirmation = _ref4.confirmation;

    dispatch(actions.changePassword('request'));

    return new Promise(function (resolve, reject) {

      get(getUrl('changePassword'), { old_password: old_password, new_password: new_password, confirmation: confirmation }, function (err, result) {
        if (!err) {
          var errors = getFormFirstErrors(result.errors);

          if (Object.keys(errors).length) {
            reject(errors);
          } else {
            dispatch(actions.displayMessage('changePassword', true));
            setTimeout(function () {
              return dispatch(actions.displayMessage('changePassword', false));
            }, 2000);
            resolve();
          }
          dispatch(actions.changePassword('response', result));
        }
      });
    }).then(function () {
      dispatch(resetForm('passwordSettings'));
    });
  }

  function generateApiKey() {
    var secret = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    dispatch(actions.generateApiKey('request'));

    request.get(getUrl('generateApiKey')).query({ secret: secret }).set('X-Requested-With', 'XMLHttpRequest').end(function (err, result) {
      if (!err) {
        var errors = getFormFirstErrors(result.body.errors);

        if (!Object.keys(errors).length) {
          dispatch(actions.generateApiKey('response', _extends({}, result.body, { secret: secret })));
          dispatch(changeFieldValue('apiKeySettings', secret ? 'apiSecret' : 'apiKey', result.body.key));
        }
      }
    });
  }

  function displayModal(modal, e) {
    if (e) e.preventDefault();
    dispatch(actions.displayModal(modal));
  }

  function deleteAccount() {
    dispatch(actions.deleteAccount('request'));

    request.post(getUrl('deleteAccount')).set('X-Requested-With', 'XMLHttpRequest').send({ _csrf: appSettings.csrfToken }).end(function (err, res) {
      dispatch(actions.deleteAccount('response'));
      if (!err && res.ok) {
        window.location.href = res.body.redirectTo || '/signout';
      }
    });
  }

  function getUrl(name) {
    return appSettings.prefix + appSettings.urls[name];
  }

  function getFormFirstErrors(validatorErrors) {
    var errors = {};

    if (validatorErrors) {
      var oneErrorPerField = validatorErrors.filter(function (e, i, a) {
        return a.findIndex(function (_e) {
          return e.field === _e.field;
        }) === i;
      });

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = oneErrorPerField[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var error = _step.value;

          errors[error.field] = error.code;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    return errors;
  }
}

module.exports = connect(mapStateToProps, function (dispatch) {
  return { dispatch: dispatch };
}, mergeProps)(SettingsContainer);