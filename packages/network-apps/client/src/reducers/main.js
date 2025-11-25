import _ from 'lodash';
import ky from 'ky';
import ih from 'immutability-helper';

const actionTypes = [
  'LOAD',
  'LOAD_SUCCESS',
  'ADD',
  'ADD_CHANGE',
  'ADD_SUBMIT',
  'SERVER_ERROR',
].reduce((a, v) => _.set(a, v, `network-apps/network/${v}`), {});

async function dispatchError(dispatch, error) {
  dispatch({
    type: actionTypes.SERVER_ERROR,
    error: await error.json?.().message || error.message,
  });
}

function load() {
  return async (dispatch, getState) => {
    const successDispatch = {
      type: actionTypes.LOAD_SUCCESS,
    };

    try {
      const networks = await ky(getState().config.base).json();

      _.assign(successDispatch, { networks });
    } catch (e) {
      return dispatchError(dispatch, e);
    }

    dispatch(successDispatch);
  };
}

function addSubmit(e) {
  e.preventDefault();

  return async (dispatch, getState) => {
    const {
      main: { add },
    } = getState();

    await ky.post(getState().config.base, { json: add }).text();

    return load()(dispatch, getState);
  };
}

const add = () => ({ type: actionTypes.ADD });
const addChange = (field, value) => ({
  type: actionTypes.ADD_CHANGE,
  field,
  value,
});

export default (state = {}, action = {}) => {
  switch (action.type) {
    case actionTypes.LOAD_SUCCESS:
      return _.pick(action, ['networks']);

    case actionTypes.ADD:
      return ih(state, { add: { $set: {} } });

    case actionTypes.ADD_CHANGE:
      return ih(state, {
        add: _.set({}, action.field, { $set: action.value }),
      });

    case actionTypes.SERVER_ERROR:
      return ih(state, {
        error: { $set: action.error },
      });

    default:
      return state;
  }
};

export { load, add, addChange, addSubmit, dispatchError };
