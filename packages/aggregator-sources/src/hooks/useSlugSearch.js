import { useCallback, useReducer } from 'react';

const initialState = {
  agenda: null,
  loading: false,
  error: null
};

function reducer(state, action) {
  console.log(action);
  switch (action.type) {
    case 'get':
      return {
        ...state,
        loading: true
      };
    case 'getSuccess':
      return {
        ...state,
        agenda: action.payload.agenda,
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
        data => dispatch({
          type: 'getSuccess',
          payload: {
            agenda: data
          }
        }),
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
