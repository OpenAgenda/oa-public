'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducer;
exports.formPlugin = formPlugin;
exports.create = create;
exports.checkSlug = checkSlug;

var _reduxForm = require('redux-form');

var _slugs = require('agendas/service/slugs');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var CREATE = 'agenda-settings/agenda/CREATE';
var CREATE_SUCCESS = 'agenda-settings/agenda/CREATE_SUCCESS';
var CREATE_FAIL = 'agenda-settings/agenda/CREATE_FAIL';
var CHECK_SLUG = 'agenda-settings/agenda/CHECK_SLUG';
var CHECK_SLUG_SUCCESS = 'agenda-settings/agenda/CHECK_SLUG_SUCCESS';
var CHECK_SLUG_FAIL = 'agenda-settings/agenda/CHECK_SLUG_FAIL';

var initialState = {};

var catchValidation = function catchValidation(res) {
  if (res.errors) {
    throw new _reduxForm.SubmissionError(Object.assign.apply(Object, _toConsumableArray(res.errors.map(function (v) {
      return _defineProperty({}, v.field, v.message);
    }))));
  }
  if (res.response && res.response.error && res.response.error.message) {
    throw new _reduxForm.SubmissionError({ _error: res.response.error.message });
  }
  return Promise.reject(res);
};

function reducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
  var action = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];


  switch (action.type) {
    default:
      return state;
  }
};

function formPlugin(state, action) {

  switch (action.type) {
    case _reduxForm.actionTypes.CHANGE:
      if (!state.values) {
        return _extends({}, state, {
          slugModified: false
        });
      }
      if (action.meta.field === 'slug') {
        return _extends({}, state, {
          slugModified: action.payload !== ''
        });
      }
      if (action.meta.field !== 'title' || state.slugModified) {
        return state;
      }
      return _extends({}, state, {
        values: _extends({}, state.values, {
          slug: (0, _slugs.generate)(action.payload)
        })
      });
    default:
      return state;
  }
}

function create(data) {
  return {
    types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
    promise: function promise(client) {
      return client.post('', { data: data }).catch(catchValidation);
    }
  };
}

function checkSlug(data) {
  return {
    types: [CHECK_SLUG, CHECK_SLUG_SUCCESS, CHECK_SLUG_FAIL],
    promise: function promise(client) {
      return client.post('slugs/available', { data: data });
    }
  };
}