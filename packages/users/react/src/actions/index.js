"use strict";

const types = require( './actionsTypes' );

module.exports = {
  setAppSettings: settings => ({ type: types.SET_APP_SETTINGS, settings }),
  setLoading: loading => ({ type: types.SET_LOADING, loading }),

  getMe: ( status = 'request', data ) => ({ type: types.GET_ME, status, data }),
  updateUser: ( status = 'request', user ) => ({ type: types.UPDATE_USER, status, user }),
  changeEmail: ( status = 'request', data ) => ({ type: types.CHANGE_EMAIL, status, data }),
  changePassword: ( status = 'request', data ) => ({ type: types.CHANGE_PASSWORD, status, data }),
  generateApiKey: ( status = 'request', data ) => ({ type: types.GENERATE_APIKEY, status, data }),
  displayModal: data => ({ type: types.DISPLAY_MODAL, data }),
  deleteAccount: ( status = 'request' ) => ({ type: types.DELETE_ACCOUNT, status }),
  displayMessage: ( name, visible ) => ({ type: types.DISPLAY_MESSAGE, name, visible }),

  listUnsubscriptions: ( status = 'request', data ) => ({ type: types.LIST_UNSUBSCRIPTIONS, status, data }),
  removeUnsubscription: ( status = 'request', data ) => ({ type: types.REMOVE_UNSUBSCRIPTION, status, data })
};