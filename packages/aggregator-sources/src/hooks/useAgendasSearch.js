import { useCallback, useReducer } from 'react';

const initialState = {
  searchValue: undefined,
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
        listLoading: true,
        searchValue: action.payload.search
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
        agendas: [...state.agendas, ...action.payload.data.agendas],
        nextPageLoading: false,
        nextPageError: null,
        total: action.payload.data.total,
        page: action.payload.page
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

export default function useAgendasSearch({ request, perPageLimit }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const list = useCallback(
    search => {
      dispatch({
        type: 'list',
        payload: {
          search
        }
      });

      return request({
        search,
        page: state.page
      }).then(
        data => dispatch({
          type: 'listSuccess',
          payload: {
            data
          }
        }),
        error => dispatch({
          type: 'listFail',
          payload: {
            error
          }
        })
      );
    },
    [request, state.page]
  );

  const nextPage = useCallback(() => {
    if (
      !state.agendas
      || !state.agendas.length
      || state.listLoading
      || state.nextLoading
      || state.page * perPageLimit >= state.total
    ) {
      return;
    }

    const newPage = state.page + 1;

    dispatch({
      type: 'nextPage',
      payload: {
        page: newPage
      }
    });

    return request({
      search: state.searchValue,
      page: newPage
    }).then(
      data => dispatch({
        type: 'nextPageSuccess',
        payload: {
          data,
          page: newPage
        }
      }),
      error => dispatch({
        type: 'nextPageFail',
        payload: {
          error
        }
      })
    );
  }, [
    state.agendas,
    state.listLoading,
    state.nextLoading,
    state.page,
    state.total,
    state.searchValue,
    perPageLimit,
    request
  ]);

  return {
    state,
    list,
    nextPage
  };
}
