"use strict";

const types = require( './actionsTypes' );

module.exports = {
  setAppSettings: settings => ({ type: types.SET_APP_SETTINGS, settings }),
  setLoading: loading => ({ type: types.SET_LOADING, loading }),

  getMe: ( status = 'request', data ) => ({ type: types.GET_ME, status, data }),
  updateUser: ( status = 'request', user ) => ({ type: types.UPDATE_USER, status, user }),
  changeEmail: ( status = 'request', data ) => ({ type: types.CHANGE_EMAIL, status, data }),
  changePassword: ( status = 'request', data ) => ({ type: types.CHANGE_PASSWORD, status, data }),
  displayDeleteAccountConfirmation: visible => ({ type: types.DISPLAY_DELETE_ACCOUNT_CONFIRMATION, visible }),
  deleteAccount: ( status = 'request', data ) => ({ type: types.DELETE_ACCOUNT, status, data }),
  displayMessage: ( name, visible ) => ({ type: types.DISPLAY_MESSAGE, name, visible })
};