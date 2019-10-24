import _ from 'lodash';

const initialState = {
  hasInboxNews: false
};

// Action types
const SET_TYPE = 'layout/SET_TYPE';
const CHECK_INBOX_NEWS = 'layout/CHECK_INBOX_NEWS';
const CHECK_INBOX_NEWS_SUCCESS = 'layout/CHECK_INBOX_NEWS_SUCCESS';
const CHECK_INBOX_NEWS_FAIL = 'layout/CHECK_INBOX_NEWS_FAIL';

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_TYPE:
      return {
        ...state,
        type: action.payload.type
      };
    case CHECK_INBOX_NEWS:
      return {
        ...state,
        loading: true
      };
    case CHECK_INBOX_NEWS_SUCCESS:
      return {
        ...state,
        inboxLoaded: true,
        hasInboxNews: action.result.hasNew,
        error: null,
        loading: false
      };
    case CHECK_INBOX_NEWS_FAIL:
      return {
        ...state,
        error: action.error,
        loading: false
      };
    case 'layout/REFLECT_UPDATE': {
      return action.changes
        .reduce((accu, [path, data]) => _.set(accu, path, data), { ...state });
    }
    default:
      return state;
  }
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

export function checkInboxNews() {
  return {
    types: [CHECK_INBOX_NEWS, CHECK_INBOX_NEWS_SUCCESS, CHECK_INBOX_NEWS_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.main.checkInboxNews);
    }
  };
}
