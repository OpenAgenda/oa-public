'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducer;
exports.isLoaded = isLoaded;
exports.load = load;
exports.create = create;
exports.update = update;
exports.remove = remove;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var LOAD = 'agenda-settings/keys/LOAD';
var LOAD_SUCCESS = 'agenda-settings/keys/LOAD_SUCCESS';
var LOAD_FAIL = 'agenda-settings/keys/LOAD_FAIL';
var CREATE = 'agenda-settings/keys/CREATE';
var CREATE_SUCCESS = 'agenda-settings/keys/CREATE_SUCCESS';
var CREATE_FAIL = 'agenda-settings/keys/CREATE_FAIL';
var UPDATE = 'agenda-settings/keys/UPDATE';
var UPDATE_SUCCESS = 'agenda-settings/keys/UPDATE_SUCCESS';
var UPDATE_FAIL = 'agenda-settings/keys/UPDATE_FAIL';
var REMOVE = 'agenda-settings/keys/REMOVE';
var REMOVE_SUCCESS = 'agenda-settings/keys/REMOVE_SUCCESS';
var REMOVE_FAIL = 'agenda-settings/keys/REMOVE_FAIL';

var initialState = {
  loaded: false
};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];


  var index = void 0;

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
        error: action.error
      });
    case CREATE:
      return _extends({}, state, {
        createLoading: true,
        createError: null
      });
    case CREATE_SUCCESS:
      return _extends({}, state, {
        createLoading: false,
        createError: null,
        data: _extends({}, state.data, {
          total: state.data.total + 1,
          items: [].concat(_toConsumableArray(state.data.items), [action.result])
        })
      });
    case CREATE_FAIL:
      return _extends({}, state, {
        updateLoading: false,
        updateError: action.error
      });
    case UPDATE:
      return _extends({}, state, {
        updateLoading: true,
        updateError: null
      });
    case UPDATE_SUCCESS:
      index = state.data.items.findIndex(function (v) {
        return v.key === action.key;
      });
      return _extends({}, state, {
        updateLoading: false,
        updateError: null,
        data: _extends({}, state.data, {
          items: [].concat(_toConsumableArray(state.data.items.slice(0, index)), [action.result], _toConsumableArray(state.data.items.slice(index + 1)))
        })
      });
    case UPDATE_FAIL:
      return _extends({}, state, {
        updateLoading: false,
        updateError: action.error
      });
    case REMOVE:
      return _extends({}, state, {
        removeLoading: true,
        removeError: null
      });
    case REMOVE_SUCCESS:
      index = state.data.items.findIndex(function (v) {
        return v.key === action.key;
      });
      return _extends({}, state, {
        removeLoading: false,
        removeError: null,
        data: _extends({}, state.data, {
          items: [].concat(_toConsumableArray(state.data.items.slice(0, index)), _toConsumableArray(state.data.items.slice(index + 1)))
        })
      });
    case REMOVE_FAIL:
      return _extends({}, state, {
        removeLoading: false,
        removeError: action.error
      });
    default:
      return state;

  }
}

function isLoaded(globalState) {
  return globalState.keys && globalState.keys.loaded;
}

function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: function promise(client, _ref) {
      var res = _ref.res,
          agenda = _ref.agenda;
      return client.get(res.keys.list.replace(':slug', agenda.slug));
    }
  };
}

function create(values) {
  return {
    types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
    promise: function promise(client, _ref2) {
      var res = _ref2.res,
          agenda = _ref2.agenda;
      return client.post(res.keys.create.replace(':slug', agenda.slug), {
        data: values
      });
    }
  };
}

function update(key, values) {
  return {
    types: [UPDATE, UPDATE_SUCCESS, UPDATE_FAIL],
    key: key,
    promise: function promise(client, _ref3) {
      var res = _ref3.res,
          agenda = _ref3.agenda;
      return client.patch(res.keys.update.replace(':slug', agenda.slug), {
        query: { key: key },
        data: values
      });
    }
  };
}

function remove(key) {
  return {
    types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
    key: key,
    promise: function promise(client, _ref4) {
      var res = _ref4.res,
          agenda = _ref4.agenda;
      return client.del(res.keys.remove.replace(':slug', agenda.slug), {
        query: { key: key }
      });
    }
  };
}
//# sourceMappingURL=keys.js.map