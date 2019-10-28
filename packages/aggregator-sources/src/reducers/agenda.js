const CREATE_AGG = 'aggregator-sources/agenda/CREATE_AGG';
const CREATE_AGG_SUCCESS = 'aggregator-sources/agenda/CREATE_AGG_SUCCESS';
const CREATE_AGG_FAIL = 'aggregator-sources/agenda/CREATE_AGG_FAIL';

const initialState = {};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_AGG_SUCCESS:
      return {
        ...state,
        isAggregator: true
      };
    default:
      return state;
  }
}

export function createAggregator(uid) {
  return {
    types: [CREATE_AGG, CREATE_AGG_SUCCESS, CREATE_AGG_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.createAggregator.replace(':uid', uid));
    }
  };
}
