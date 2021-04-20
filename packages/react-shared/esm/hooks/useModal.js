import _slicedToArray from "@babel/runtime-corejs3/helpers/slicedToArray";
import { useReducer, useCallback, useMemo } from 'react';
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

export default function useModal() {
  var _useReducer = useReducer(modalReducer, initialState),
      _useReducer2 = _slicedToArray(_useReducer, 2),
      state = _useReducer2[0],
      dispatch = _useReducer2[1];

  var open = useCallback(function (data) {
    dispatch({
      type: 'open',
      data: data
    });
  }, [dispatch]);
  var update = useCallback(function (data) {
    dispatch({
      type: 'update',
      data: data
    });
  }, [dispatch]);
  var close = useCallback(function () {
    dispatch({
      type: 'close'
    });
  }, [dispatch]);
  return useMemo(function () {
    return {
      isOpen: state.isOpen,
      data: state.data,
      open: open,
      update: update,
      close: close
    };
  }, [state.isOpen, state.data, open, update, close]);
}
//# sourceMappingURL=useModal.js.map