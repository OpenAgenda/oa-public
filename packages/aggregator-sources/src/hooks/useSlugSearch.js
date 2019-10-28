import { useCallback, useReducer } from 'react';

const initialState = {
  agenda: null,
  loading: false,
  error: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'get':
      return {
        ...state,
        loading: true
      };
    case 'getSuccess':
      return {
        ...state,
        agenda: action.payload.data.agenda,
        loading: false
      };
    case 'getFail':
      return {
        ...state,
        agenda: null,
        loading: false,
        error: action.payload.error
      };
    default:
      return state;
  }
}

export default function useSlugSearch({ request }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const get = useCallback(
    v => {
      dispatch({ type: 'get' });

      return request(v).then(
        data => setTimeout(
          () => dispatch({
            type: 'getSuccess',
            payload: {
              data
            }
          }),
          400
        ),
        error => dispatch({
          type: 'getFail',
          payload: {
            error
          }
        })
      );
    },
    [request]
  );

  return {
    state,
    get
  };
}
