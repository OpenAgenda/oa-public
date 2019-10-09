const initialState = {
  hasInboxNews: false
};

// Action types
const SET_TYPE = 'header/SET_TYPE';
const HAS_INBOX_NEWS = 'header/HAS_INBOX_NEWS';
const HAS_INBOX_NEWS_SUCCESS = 'header/HAS_INBOX_NEWS_SUCCESS';
const HAS_INBOX_NEWS_FAIL = 'header/HAS_INBOX_NEWS_FAIL';

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_TYPE:
      return {
        ...state,
        type: action.payload.type
      };
    case HAS_INBOX_NEWS:
      return {
        ...state,
        loading: true
      };
    case HAS_INBOX_NEWS_SUCCESS:
      return {
        ...state,
        inboxLoaded: true,
        hasInboxNews: action.result.hasNew,
        error: null,
        loading: false
      };
    case HAS_INBOX_NEWS_FAIL:
      return {
        ...state,
        error: action.error,
        loading: false
      };
  }

  return state;
}

// Actions
export function setType(type) {
  return {
    type: SET_TYPE,
    payload: {
      type
    }
  };
}

export function hasInboxNews() {
  return {
    types: [HAS_INBOX_NEWS, HAS_INBOX_NEWS_SUCCESS, HAS_INBOX_NEWS_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.hasInboxNews);
    }
  };
}
