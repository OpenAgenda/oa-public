"use strict";

var types = require('./actionsTypes');

module.exports = {
  setAppSettings: function setAppSettings(settings) {
    return { type: types.SET_APP_SETTINGS, settings: settings };
  },
  setLoading: function setLoading(loading) {
    return { type: types.SET_LOADING, loading: loading };
  },

  getMe: function getMe() {
    var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'request';
    var data = arguments[1];
    return { type: types.GET_ME, status: status, data: data };
  },
  updateUser: function updateUser() {
    var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'request';
    var user = arguments[1];
    return { type: types.UPDATE_USER, status: status, user: user };
  },
  changeEmail: function changeEmail() {
    var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'request';
    var data = arguments[1];
    return { type: types.CHANGE_EMAIL, status: status, data: data };
  },
  changePassword: function changePassword() {
    var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'request';
    var data = arguments[1];
    return { type: types.CHANGE_PASSWORD, status: status, data: data };
  },
  generateApiKey: function generateApiKey() {
    var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'request';
    var data = arguments[1];
    return { type: types.GENERATE_APIKEY, status: status, data: data };
  },
  displayModal: function displayModal(data) {
    return { type: types.DISPLAY_MODAL, data: data };
  },
  deleteAccount: function deleteAccount() {
    var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'request';
    return { type: types.DELETE_ACCOUNT, status: status };
  },
  displayMessage: function displayMessage(name, visible) {
    return { type: types.DISPLAY_MESSAGE, name: name, visible: visible };
  }
};