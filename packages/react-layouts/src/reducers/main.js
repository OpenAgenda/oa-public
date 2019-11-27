const initialState = {
  hasInboxNews: false
};

// Action types
const CHECK_INBOX_NEWS = 'react-layouts/main/CHECK_INBOX_NEWS';
const CHECK_INBOX_NEWS_SUCCESS = 'react-layouts/main/CHECK_INBOX_NEWS_SUCCESS';
const CHECK_INBOX_NEWS_FAIL = 'react-layouts/main/CHECK_INBOX_NEWS_FAIL';
const UPDATE_USER = 'react-layouts/main/UPDATE_USER';

export default (state = initialState, action) => {
  switch (action.type) {
    case CHECK_INBOX_NEWS:
      return {
        ...state,
        loading: true
      };
    case CHECK_INBOX_NEWS_SUCCESS:
      return {
        ...state,
        inboxLoaded: true,
        hasInboxNews: action.result.data.hasNew,
        error: null,
        loading: false
      };
    case CHECK_INBOX_NEWS_FAIL:
      return {
        ...state,
        error: action.error,
        loading: false
      };
    case UPDATE_USER:
      return {
        ...state,
        user: action.payload.user
      };
    default:
      return state;
  }
};

// Actions
export function checkInboxNews() {
  return {
    types: [CHECK_INBOX_NEWS, CHECK_INBOX_NEWS_SUCCESS, CHECK_INBOX_NEWS_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.main.checkInboxNews);
    }
  };
}
