import { isHTTPError } from 'ky';

const LOAD = 'user-apps/userKeys/LOAD';
const LOAD_SUCCESS = 'user-apps/userKeys/LOAD_SUCCESS';
const LOAD_FAIL = 'user-apps/userKeys/LOAD_FAIL';
const CREATE = 'user-apps/userKeys/CREATE';
const CREATE_SUCCESS = 'user-apps/userKeys/CREATE_SUCCESS';
const CREATE_FAIL = 'user-apps/userKeys/CREATE_FAIL';
const UPDATE = 'user-apps/userKeys/UPDATE';
const UPDATE_SUCCESS = 'user-apps/userKeys/UPDATE_SUCCESS';
const UPDATE_FAIL = 'user-apps/userKeys/UPDATE_FAIL';
const REMOVE = 'user-apps/userKeys/REMOVE';
const REMOVE_SUCCESS = 'user-apps/userKeys/REMOVE_SUCCESS';
const REMOVE_FAIL = 'user-apps/userKeys/REMOVE_FAIL';

const initialState = {
  loaded: false,
  // Plaintext keys keyed by id, populated only at creation (the store hashes
  // keys, so the value is returned exactly once). Never persisted nor reloaded.
  revealed: {},
};

const errorData = (error) =>
  error.response?.data?.error ?? error.response?.data;

export default function reducer(state = initialState, action = {}) {
  let index;

  switch (action.type) {
    case LOAD:
      return { ...state, loading: true };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result,
        error: null,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        data: null,
        error: errorData(action.error),
      };
    case CREATE:
      return { ...state, createLoading: true, createError: null };
    case CREATE_SUCCESS:
      return {
        ...state,
        createLoading: false,
        createError: null,
        data: {
          ...state.data,
          total: state.data.total + 1,
          // Newest first, matching the server's createdAt-desc list order (so
          // the row doesn't jump on the next reload).
          items: [action.result.record, ...state.data.items],
        },
        revealed: {
          ...state.revealed,
          [action.result.record.id]: action.result.key,
        },
      };
    case CREATE_FAIL:
      return {
        ...state,
        createLoading: false,
        createError: errorData(action.error),
      };
    case UPDATE:
      return { ...state, updateLoading: true, updateError: null };
    case UPDATE_SUCCESS:
      index = state.data.items.findIndex((v) => v.id === action.id);
      return {
        ...state,
        updateLoading: false,
        updateError: null,
        data: {
          ...state.data,
          items: [
            ...state.data.items.slice(0, index),
            action.result.record,
            ...state.data.items.slice(index + 1),
          ],
        },
      };
    case UPDATE_FAIL:
      return {
        ...state,
        updateLoading: false,
        updateError: errorData(action.error),
      };
    case REMOVE:
      return { ...state, removeLoading: true, removeError: null };
    case REMOVE_SUCCESS: {
      index = state.data.items.findIndex((v) => v.id === action.id);
      const revealed = { ...state.revealed };
      delete revealed[action.id];
      return {
        ...state,
        removeLoading: false,
        removeError: null,
        revealed,
        data: {
          ...state.data,
          total: state.data.total - 1,
          items: [
            ...state.data.items.slice(0, index),
            ...state.data.items.slice(index + 1),
          ],
        },
      };
    }
    case REMOVE_FAIL:
      return {
        ...state,
        removeLoading: false,
        removeError: errorData(action.error),
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.userKeys && globalState.userKeys.loaded;
}

// ky throws an HTTPError on non-2xx; resolve its JSON body onto `error.response.data`
// so reducers can read it, and rethrow. Non-HTTP errors propagate untouched.
async function withErrorBody(error) {
  if (!isHTTPError(error)) throw error;
  error.response.data = await error.response.json().catch(() => null);
  throw error;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();
      return client.get(res.keys.list).json().catch(withErrorBody);
    },
  };
}

// `oaKind` is the visibility tier and is required by the endpoint — `pk`
// (read-only, public-locked) or `sk` (read+write at the owner's tier). Keys are
// created one at a time; there is no forced pk+sk pair.
export function create(oaKind) {
  return {
    types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();
      return client
        .post(res.keys.create, { json: { oaKind } })
        .json()
        .catch(withErrorBody);
    },
  };
}

export function update(id, values) {
  return {
    types: [UPDATE, UPDATE_SUCCESS, UPDATE_FAIL],
    id,
    promise: ({ client }, { getState }) => {
      const { res } = getState();
      return client
        .patch(res.keys.update.replace(':id', id), {
          json: { name: values.name },
        })
        .json()
        .catch(withErrorBody);
    },
  };
}

export function remove(id) {
  return {
    types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
    id,
    promise: ({ client }, { getState }) => {
      const { res } = getState();
      return client
        .delete(res.keys.remove.replace(':id', id))
        .json()
        .catch(withErrorBody);
    },
  };
}
