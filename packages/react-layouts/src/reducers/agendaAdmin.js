const VERIFY_LOCATION_COUNT = 'react-layouts/agendaAdmin/VERIFY_LOCATION_COUNT';
const VERIFY_LOCATION_COUNT_SUCCESS = 'react-layouts/agendaAdmin/VERIFY_LOCATION_COUNT_SUCCESS';
const VERIFY_LOCATION_COUNT_FAIL = 'react-layouts/agendaAdmin/VERIFY_LOCATION_COUNT_FAIL';
const UPDATE_AGENDA = 'react-layouts/agendaAdmin/UPDATE_AGENDA';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case VERIFY_LOCATION_COUNT:
      return {
        ...state,
        locationCount: null,
      };
    case VERIFY_LOCATION_COUNT_SUCCESS:
      return {
        ...state,
        locationCount: action.result.data.count,
      };
    case VERIFY_LOCATION_COUNT_FAIL:
      return {
        ...state,
        locationCount: null,
      };
    // TODO replace `UPDATE_AGENDA` (re)action with a background refresh with react-query
    case UPDATE_AGENDA:
      return {
        ...state,
        agenda: action.payload.agenda,
      };
    default:
      return state;
  }
};

export function verifyLocationCount(uid) {
  return {
    types: [
      VERIFY_LOCATION_COUNT,
      VERIFY_LOCATION_COUNT_SUCCESS,
      VERIFY_LOCATION_COUNT_FAIL,
    ],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(
        res.agendaAdmin.verifyLocationCount.replace(':uid', uid)
      );
    },
  };
}
