"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = useModal;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/slicedToArray"));

var _react = require("react");

var initialState = {
  isOpen: false,
  data: {}
};

function modalReducer(state, action) {
  switch (action.type) {
    case 'open':
      return {
        isOpen: true,
        data: action.data
      };

    case 'close':
      return {
        isOpen: false,
        data: state.data
      };

    case 'update':
      return {
        isOpen: state.isOpen,
        data: action.data
      };

    default:
      return state;
  }
}

function useModal() {
  var _useReducer = (0, _react.useReducer)(modalReducer, initialState),
      _useReducer2 = (0, _slicedToArray2.default)(_useReducer, 2),
      state = _useReducer2[0],
      dispatch = _useReducer2[1];

  var open = (0, _react.useCallback)(function (data) {
    dispatch({
      type: 'open',
      data: data
    });
  }, [dispatch]);
  var update = (0, _react.useCallback)(function (data) {
    dispatch({
      type: 'update',
      data: data
    });
  }, [dispatch]);
  var close = (0, _react.useCallback)(function () {
    dispatch({
      type: 'close'
    });
  }, [dispatch]);
  return (0, _react.useMemo)(function () {
    return {
      isOpen: state.isOpen,
      data: state.data,
      open: open,
      update: update,
      close: close
    };
  }, [state.isOpen, state.data, open, update, close]);
}

module.exports = exports.default;
//# sourceMappingURL=useModal.js.map