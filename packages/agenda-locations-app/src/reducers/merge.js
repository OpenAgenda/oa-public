import axios from 'axios';
import * as onGoinActions from './onGoinModal';

const INITIATE = 'agenda-locations/merge/INITIATE';
const INITIATE_FROM_DUPLICATES = 'agenda-locations/merge/INITIATE_FROM_DUPLICATATES';
const SELECT_LOCATIONS = 'agenda-locations/merge/SELECT_LOCATIONS';
const VALIDATE_LOCATIONS = 'agenda-locations/merge/VALIDATE_LOCATIONS';
const SELECT_TARGET = 'agenda-locations/merge/SELECT_TARGET';
const CLOSE_MERGE = 'agenda-location/merge/CLOSE_MERGE';
const initialState = false;

export default function reducer(state = initialState, action) {
  console.log(action);
  switch (action.type) {
    case INITIATE:
      return {
        ...state,
        step: 1
      };
    case INITIATE_FROM_DUPLICATES:
      return {
        ...state,
        step: 1,
        locationUids: action.locationUids,
        entryPoint: action.entryPoint
      };
    case SELECT_LOCATIONS:
      return {
        ...state,
        locationUids: action.locationUids,
      };
    case VALIDATE_LOCATIONS:
      return {
        ...state,
        step: 2
      };
    case SELECT_TARGET:
      return {
        ...state,
        step: 3,
        target: action.target
      };
    case CLOSE_MERGE:
      console.log('closing Merge');
      return false;
    default:
      return state;
  }
}

export function initiate() {
  return {
    type: INITIATE,
  };
}

export function initiateFromDuplicates(locationUids, entryPoint) {
  return {
    type: INITIATE_FROM_DUPLICATES,
    locationUids,
    entryPoint
  };
}

export function disqualifyDuplicates(locationUids, res, nextLocation) {
  return ({ history }, { dispatch }) => {
    axios.post(res.disqualifyDuplicates, { uids: locationUids }, (err, result) => {});
    dispatch({ type: 'agenda-location/merge/CLOSE_MERGE' });
    history.push(nextLocation);
  };
}

export function selectLocations(locationUids) {
  return {
    type: SELECT_LOCATIONS,
    locationUids
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
    target
  };
}

export function launchMerge(merge, res, nextLocation) {
  return ({ history }, { dispatch }) => {
    console.log('launchMerge');
    const merged = merge.locationUids.filter(uid => uid !== merge.target.uid);
    if (!merge.target) console.log('no target for merge!!');
    if (!merge || !merge.target || !merge.locationUids.length) return;
    const body = {
      mergeIn: merge.target.uid,
      merged,
    };
    axios.post(res.merge, body, (err, results) => {});
    history.push(nextLocation);
    dispatch({ type: 'agenda-location/merge/CLOSE_MERGE' });
    dispatch(onGoinActions.initiate('merge'));
  };
}

export function closeMerge() {
  return {
    type: CLOSE_MERGE,
  };
}
