'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducer;
exports.formPlugin = formPlugin;
exports.isLoaded = isLoaded;
exports.load = load;
exports.create = create;
exports.edit = edit;
exports.imageUploaded = imageUploaded;
exports.checkSlug = checkSlug;
exports.remove = remove;

var _reduxForm = require('redux-form');

var _slugs = require('agendas/service/slugs');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var LOAD = 'agenda-settings/agenda/LOAD';
var LOAD_SUCCESS = 'agenda-settings/agenda/LOAD_SUCCESS';
var LOAD_FAIL = 'agenda-settings/agenda/LOAD_FAIL';
var CREATE = 'agenda-settings/agenda/CREATE';
var CREATE_SUCCESS = 'agenda-settings/agenda/CREATE_SUCCESS';
var CREATE_FAIL = 'agenda-settings/agenda/CREATE_FAIL';
var EDIT = 'agenda-settings/agenda/EDIT';
var EDIT_SUCCESS = 'agenda-settings/agenda/EDIT_SUCCESS';
var EDIT_FAIL = 'agenda-settings/agenda/EDIT_FAIL';
var IMAGE_UPLOADED = 'agenda-settings/agenda/IMAGE_UPLOADED';
var CHECK_SLUG = 'agenda-settings/agenda/CHECK_SLUG';
var CHECK_SLUG_SUCCESS = 'agenda-settings/agenda/CHECK_SLUG_SUCCESS';
var CHECK_SLUG_FAIL = 'agenda-settings/agenda/CHECK_SLUG_FAIL';
var REMOVE = 'agenda-settings/agenda/REMOVE';
var REMOVE_SUCCESS = 'agenda-settings/agenda/REMOVE_SUCCESS';
var REMOVE_FAIL = 'agenda-settings/agenda/REMOVE_FAIL';

var initialState = {
  loaded: false
};

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
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  switch (action.type) {
    case LOAD:
      return _extends({}, state, {
        loading: true
      });
    case LOAD_SUCCESS:
      return _extends({}, state, {
        loading: false,
        loaded: true,
        data: action.result,
        error: null
      });
    case LOAD_FAIL:
      return _extends({}, state, {
        loading: false,
        loaded: false,
        data: null,
        error: typeof action.error === 'string' ? action.error : 'Error'
      });
    case IMAGE_UPLOADED:
      if (action.error) return state;
      return _extends({}, state, {
        imageChanged: true,
        data: _extends({}, state.data, {
          image: action.image || null
        })
      });
    case EDIT_SUCCESS:
      return _extends({}, state, {
        imageChanged: false,
        data: action.result.agenda
      });
    default:
      return state;
  }
};

function formPlugin() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];


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

function isLoaded(globalState) {
  return globalState.agenda && globalState.agenda.loaded;
}

function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: function promise(client, _ref2) {
      var res = _ref2.res,
          agenda = _ref2.agenda;
      return client.get(res.get.replace(':uid', agenda.uid));
    }
  };
}

function create(data) {
  return {
    types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
    promise: function promise(client, _ref3) {
      var res = _ref3.res;
      return client.post(res.create, { data: data }).catch(catchValidation);
    }
  };
}

function edit(data) {
  return {
    types: [EDIT, EDIT_SUCCESS, EDIT_FAIL],
    promise: function promise(client, _ref4) {
      var res = _ref4.res,
          agenda = _ref4.agenda;
      return client.post(res.set.replace(':slug', agenda.data.slug), { data: data }).catch(catchValidation);
    }
  };
}

function imageUploaded(image, error) {
  return {
    type: IMAGE_UPLOADED,
    image: image,
    error: error
  };
}

function checkSlug(data) {
  return {
    types: [CHECK_SLUG, CHECK_SLUG_SUCCESS, CHECK_SLUG_FAIL],
    promise: function promise(client, _ref5) {
      var res = _ref5.res;
      return client.post(res.slugAvailable, { data: data });
    }
  };
}

function remove() {
  return {
    types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
    promise: function promise(client, _ref6) {
      var res = _ref6.res,
          agenda = _ref6.agenda;
      return client.post(res.remove.replace(':slug', agenda.data.slug));
    }
  };
}
//# sourceMappingURL=agenda.js.map