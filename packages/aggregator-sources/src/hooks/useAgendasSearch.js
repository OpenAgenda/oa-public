import { useCallback, useReducer } from 'react';

const initialState = {
  agendas: [],
  listLoading: false,
  nextPageLoading: false,
  listError: null,
  nextPageError: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'list':
      return {
        ...state,
        listLoading: true
      };
    case 'listSuccess':
      return {
        ...state,
        agendas: action.payload.data.agendas,
        listLoading: false,
        listError: null,
        total: action.payload.data.total,
        page: 1
      };
    case 'listFail':
      return {
        ...state,
        agendas: [],
        listLoading: false,
        listError: action.payload.error,
        total: null,
        page: 1
      };
    case 'nextPage':
      return {
        ...state,
        nextPageLoading: true
      };
    case 'nextPageSuccess':
      return {
        ...state,
        agendas: action.payload.data.agendas,
        nextPageLoading: false,
        nextPageError: null,
        total: action.payload.data.total,
        page: action.page
      };
    case 'nextPageFail':
      return {
        ...state,
        agendas: [],
        nextPageLoading: false,
        nextPageError: action.payload.error
      };
    default:
      return state;
  }
}

export default function useAgendasSearch({ request, field = 'search' }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const list = useCallback(
    v => {
      dispatch({
        type: 'list',
        payload: {
          [field]: v === '' ? undefined : v
        }
      });
      return request(v).then(
        data => setTimeout(
          () => dispatch({
            type: 'listSuccess',
            payload: {
              data
            }
          }),
          400
        ),
        error => dispatch({
          type: 'listFail',
          payload: {
            error
          }
        })
      );
    },
    [request, field]
  );

  return {
    state,
    list
  };
}
