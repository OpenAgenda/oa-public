import { useReducer, useCallback, useMemo } from 'react';

const initialState = {
  isOpen: false,
  data: {},
};

function modalReducer(state, action) {
  switch (action.type) {
    case 'open':
      return {
        isOpen: true,
        data: action.data,
      };
    case 'close':
      return {
        isOpen: false,
        data: state.data,
      };
    case 'update':
      return {
        isOpen: state.isOpen,
        data: action.data,
      };
    default:
      return state;
  }
}

export default function useModal() {
  const [state, dispatch] = useReducer(modalReducer, initialState);

  const open = useCallback(
    data => {
      dispatch({
        type: 'open',
        data,
      });
    },
    [dispatch]
  );

  const update = useCallback(
    data => {
      dispatch({
        type: 'update',
        data,
      });
    },
    [dispatch]
  );

  const close = useCallback(() => {
    dispatch({ type: 'close' });
  }, [dispatch]);

  return useMemo(
    () => ({
      isOpen: state.isOpen,
      data: state.data,
      open,
      update,
      close,
    }),
    [state.isOpen, state.data, open, update, close]
  );
}
