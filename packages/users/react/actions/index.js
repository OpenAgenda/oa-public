"use strict";

const types = require( './actionsTypes' );

module.exports = {
  setAppSettings: settings => ({ type: types.SET_APP_SETTINGS, settings }),
  loading: loading => ({ type: types.LOADING, loading }),
  
  getMe: ( status = 'request', data ) => ({ type: types.GET_ME, status, data }),
  updateProfile: ( status = 'request', data ) => ({ type: types.UPDATE_PROFILE, status, data }),
  changeEmail: ( status = 'request', data ) => ({ type: types.CHANGE_EMAIL, status, data }),
  changePassword: ( status = 'request', data ) => ({ type: types.CHANGE_PASSWORD, status, data }),
};