import * as onGoingActions from './onGoingModal.js';

const INITIATE = 'agenda-locations/merge/INITIATE';
const INITIATE_FROM_DUPLICATES = 'agenda-locations/merge/INITIATE_FROM_DUPLICATATES';
const SELECT_LOCATIONS = 'agenda-locations/merge/SELECT_LOCATIONS';
const VALIDATE_LOCATIONS = 'agenda-locations/merge/VALIDATE_LOCATIONS';
const SELECT_TARGET = 'agenda-locations/merge/SELECT_TARGET';
const CLOSE_MERGE = 'agenda-location/merge/CLOSE_MERGE';
const initialState = false;

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case INITIATE:
      return {
        ...state,
        step: 1,
        originalPage: action.originalPage,
        originalSearch: action.originalSearch,
      };
    case INITIATE_FROM_DUPLICATES:
      return {
        ...state,
        step: 1,
        locationUids: action.locationUids,
        entryPoint: action.entryPoint,
        originalPage: action.originalPage,
        originalSearch: action.originalSearch,
      };
    case SELECT_LOCATIONS:
      return {
        ...state,
        locationUids: action.locationUids,
      };
    case VALIDATE_LOCATIONS:
      return {
        ...state,
        step: 2,
      };
    case SELECT_TARGET:
      return {
        ...state,
        step: 3,
        target: action.target,
      };
    case CLOSE_MERGE:
      return false;
    default:
      return state;
  }
}

export function initiate(originalPage = 1, originalSearch = {}) {
  return {
    type: INITIATE,
    originalPage,
    originalSearch,
  };
}

export function initiateFromDuplicates(
  locationUids,
  entryPoint,
  originalPage = 1,
  originalSearch = {},
) {
  return {
    type: INITIATE_FROM_DUPLICATES,
    locationUids,
    entryPoint,
    originalPage,
    originalSearch,
  };
}

export function disqualifyDuplicates(
  locationUids,
  res,
  agendaSlug,
  prefix,
  setErrorModal,
) {
  return ({ history }, { dispatch, getState }) => {
    const { merge } = getState();
    fetch(res.disqualifyDuplicates.replace(':agendaSlug', agendaSlug), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uids: locationUids }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Invalid status (${response.status})`);
        }
        return response.json();
      })
      .then(() => {
        dispatch({ type: 'agenda-location/merge/CLOSE_MERGE' });
        history.push({
          pathname: prefix,
          search: `?${new URLSearchParams({
            ...merge.originalSearch,
            page: merge.originalPage || 1,
          }).toString()}`,
        });
      })
      .catch((err) => {
        console.log(err);
        setErrorModal(err);
      });
  };
}

export function selectLocations(locationUids) {
  return {
    type: SELECT_LOCATIONS,
    locationUids,
  };
}

export function validateLocations() {
  return {
    type: VALIDATE_LOCATIONS,
  };
}

export function selectTarget(target) {
  return {
    type: SELECT_TARGET,
    target,
  };
}

export function launchMerge(merge, res, prefix, setErrorModal, setSpin) {
  return ({ history }, { dispatch }) => {
    const merged = merge.locationUids.filter((uid) => uid !== merge.target.uid);
    if (!merge.target) console.log('no target for merge!!');
    if (!merge || !merge.target || !merge.locationUids.length) return;
    setSpin(true);
    const body = {
      mergeIn: merge.target.uid,
      merged,
    };
    fetch(res.merge, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(() => {
        setSpin(false);
        // Use the stored originalPage and originalSearch from merge state
        history.push({
          pathname: prefix,
          search: `?${new URLSearchParams({
            ...merge.originalSearch,
            page: merge.originalPage || 1,
          }).toString()}`,
        });
        dispatch({ type: 'agenda-location/merge/CLOSE_MERGE' });
        dispatch(onGoingActions.initiate('merge'));
      })
      .catch((err) => {
        setSpin(false);
        console.log('error', err);
        setErrorModal(err);
      });
  };
}

export function closeMerge() {
  return {
    type: CLOSE_MERGE,
  };
}
