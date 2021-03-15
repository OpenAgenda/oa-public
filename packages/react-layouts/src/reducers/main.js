const initialState = {
  hasInboxNews: false,
};

// Action types
const GET_USER = 'react-layouts/main/GET_USER';
const GET_USER_SUCCESS = 'react-layouts/main/GET_USER_SUCCESS';
const GET_USER_FAIL = 'react-layouts/main/GET_USER_FAIL';
const CHECK_INBOX_NEWS = 'react-layouts/main/CHECK_INBOX_NEWS';
const CHECK_INBOX_NEWS_SUCCESS = 'react-layouts/main/CHECK_INBOX_NEWS_SUCCESS';
const CHECK_INBOX_NEWS_FAIL = 'react-layouts/main/CHECK_INBOX_NEWS_FAIL';
const UPDATE_USER = 'react-layouts/main/UPDATE_USER';

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_USER:
      return {
        ...state,
        userLoading: true,
      };
    case GET_USER_SUCCESS:
      return {
        ...state,
        userLoaded: true,
        user: action.result.data,
        userError: null,
        userLoading: false,
      };
    case GET_USER_FAIL:
      return {
        ...state,
        userError: action.error,
        userLoading: false,
      };
    case CHECK_INBOX_NEWS:
      return {
        ...state,
        inboxNewsLoading: true,
      };
    case CHECK_INBOX_NEWS_SUCCESS:
      return {
        ...state,
        inboxLoaded: true,
        hasInboxNews: action.result.data.hasNew,
        inboxNewsError: null,
        inboxNewsLoading: false,
      };
    case CHECK_INBOX_NEWS_FAIL:
      return {
        ...state,
        inboxNewsError: action.error,
        inboxNewsLoading: false,
      };
    case UPDATE_USER:
      return {
        ...state,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

// Actions
export function getUser() {
  return {
    types: [GET_USER, GET_USER_SUCCESS, GET_USER_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.main.getUser, {
        params: {
          $client: {
            includeImagePath: true,
          },
        },
      });
    },
  };
}

export function checkInboxNews() {
  return {
    types: [CHECK_INBOX_NEWS, CHECK_INBOX_NEWS_SUCCESS, CHECK_INBOX_NEWS_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.main.checkInboxNews);
    },
  };
}
