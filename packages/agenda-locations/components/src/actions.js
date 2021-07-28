import update from 'immutability-helper';
import utils from '@openagenda/utils';
import dl from '@openagenda/dom-utils/documentLocation';

// little counter
function _syncCounter() {
  if (typeof window === 'undefined') return;

  if (!window.oa || !window.oa.verifiedLocationsCounter) return;

  setTimeout(() => {
    window.oa.verifiedLocationsCounter();
  }, 1000);
}

function removedLocation(state, index) {
  _syncCounter();

  return update(state, {
    locations: { $splice: [[index, 1]] },
    modal: {
      data: {
        isRemoved: { $set: true },
      },
    },
  });
}

function editLocation(state, location, locationIndex) {
  return update(state, {
    form: {
      $set: {
        location,
        locationIndex,
      },
    },
  });
}

function updateLocationList(state, locations, total, page) {
  _syncCounter();

  return {
    locations,
    total,
    page,
  };
}

function closeForm(state, location) {
  const updatedState = {
    locations: {},
  };

  updatedState.form = { $set: false };

  // if an image was uploaded before form was closed,
  // image must be updated
  if (state.form && state.form.locationIndex) {
    updatedState.locations[state.form.locationIndex] = {
      image: { $set: location.image },
    };
  }

  return update(state, updatedState);
}

function newLocation(state) {
  return update(state, {
    form: { $set: {} },
  });
}

function addLocation(state, location) {
  _syncCounter();

  return update(state, {
    locations: { $splice: [[0, 0, location]] },
    form: { $set: false },
  });
}

/**
 * add or remove location item from
 * merge list
 */

function toggleMergeItem(state, location) {
  const { merge } = state;
  const locationUids = merge.locationUids.concat();
  const index = locationUids.indexOf(location.uid);

  if (index === -1) {
    locationUids.push(location.uid);
  } else {
    locationUids.splice(index, 1);
  }

  return {
    merge: {
      locationUids,
      target: state.merge.target,
      step: 1,
      entryPoint: merge.entryPoint,
      query: merge.query
    },
  };
}

/* change merge target */

function toggleMergeTarget(state, location) {
  const { merge } = state;
  const locationUids = merge.locationUids.concat();
  if (merge.targetUid === location.uid) {
    return {
      merge: {
        locationUids: locationUids.filter(i => i !== location.uid),
        target: null,
        step: 2,
        entryPoint: merge.entryPoint,
        query: merge.query
      },
    };
  }
  return {
    merge: {
      locationUids: locationUids.filter(i => i !== location.uid),
      target: location,
      step: 2,
      entryPoint: merge.entryPoint,
      query: merge.query
    },
  };
}

/**
 * update a location in general location list.
 * Optionnally, close the form
 */
function updateEditedLocation(state, location, closeForm) {
  const updatedState = {
    locations: {},
  };

  if (closeForm) {
    updatedState.form = { $set: false };
  }

  updatedState.locations[state.form.locationIndex] = { $set: location };

  _syncCounter();

  return update(state, updatedState);
}

function mergeOnGoing(state) {
  return update(state, {
    merge: {
      $set: {
        locationUids: state.merge.locationUids,
        target: state.merge.target,
        onGoing: true,
        query: state.merge.query
      }
    },
    modal: { $set: { type: 'merge' } },
  });
}

function changeMergeModal(state, err) {
  return update(state, {
    merge: {
      $set: {
        locationUids: state.merge.locationUids,
        target: state.merge.target,
        onGoing: true,
      }
    },
    modal: { $set: { type: 'merge', err } },
  });
}

function closeMerge(state) {
  const { merge } = state;
  if (merge?.query) {
    dl.setQueryPart(merge.query);
  }
  return update(state, {
    merge: { $set: false },
    query: { $set: {} },
    locations: { $set: [] },
    modal: { $set: false }
  });
}

function openDetailModal(state, location) {
  return update(state, {
    modal: { $set: { type: 'detail', location } }
  });
}

/**
 * toggle merge mode on or off
 * used in AgendaAdminLocations
 */
function toggleMerge(state, on) {
  const { merge } = state;
  const q = dl.getQuery() || {};
  if (on) {
    return {
      merge: {
        locationUids: [],
        target: null,
        step: 1,
        query: q
      },
    };
  }
  dl.setQueryPart(merge.query);
  return {
    merge: false,
  };
}

function goToMergeStep2(state) {
  const { merge } = state;
  const locationUids = merge.locationUids.concat();
  return {
    merge: {
      locationUids,
      target: merge.target,
      step: 2,
      entryPoint: merge.entryPoint,
      query: merge.query
    },
  };
}

function goToMergeStep3(state, location) {
  const { merge } = state;
  const locationUids = merge.locationUids.concat();
  return {
    merge: {
      locationUids,
      target: location,
      step: 3,
      entryPoint: merge.entryPoint,
      query: merge.query
    },
  };
}

function backToMergeStep1(state) {
  const { merge } = state;
  const locationUids = merge.locationUids.concat();
  return {
    merge: {
      locationUids,
      target: null,
      step: 1,
      entryPoint: merge.entryPoint,
      query: merge.query
    },
  };
}

function backToMergeStep2(state) {
  const { merge } = state;
  const locationUids = merge.locationUids.concat();
  return {
    merge: {
      locationUids,
      target: null,
      step: 2,
      entryPoint: merge.entryPoint,
      query: merge.query
    },
  };
}

function goToMergeStep1FromDuplicates(state, location) {
  const locationUids = location.duplicateCandidates.concat(location.uid);
  const q = dl.getQuery() || {};
  return {
    merge: {
      locationUids,
      target: null,
      step: 1,
      entryPoint: location.uid,
      query: q
    },
  };
}

function updateSearchQuery(current, field, newSearchValue) {
  const query = JSON.parse(JSON.stringify(current || {}));

  if (typeof newSearchValue === 'string' && !newSearchValue.length) {
    newSearchValue = undefined;
  }

  if (newSearchValue === undefined) {
    if (query[field] !== undefined) delete query[field];
  } else {
    query[field] = newSearchValue;
  }

  return query;
}

function queryChange(state, query) {
  dl.setQueryPart(query);

  return {
    query,
  };
}

function getQuery() {
  // query reference is in url now.
  return dl.getQuery() || {};
}

function displayRemoveConfirmModal(state, location, index) {
  return {
    modal: {
      type: 'removeLocation',
      data: {
        location,
        index,
      },
    },
  };
}

function closeModal() {
  return {
    modal: false,
  };
}

function actions(options) {
  const { getState, setState } = utils.extend(
    {
      setState() {}, // state setter
      getState() {},
    },
    options
  );

  /**
   * simplifies stateless testing. calls
   * input function by prepending current state
   * and applies value as new state
   */

  function assign(fn) {
    return (...args) => {
      const state = getState();
      const newState = fn(...[state].concat(args));

      setState(newState);

      return newState;
    };
  }

  return {
    // not actually an action
    getState,

    editLocation: assign(editLocation),

    updateEditedLocation: assign(updateEditedLocation),
    newLocation: assign(newLocation),
    addLocation: assign(addLocation),
    removedLocation: assign(removedLocation),
    closeForm: assign(closeForm),

    closeMerge: assign(closeMerge),
    toggleMerge: assign(toggleMerge),
    mergeOnGoing: assign(mergeOnGoing),
    changeMergeModal: assign(changeMergeModal),

    goToMergeStep1FromDuplicates: assign(goToMergeStep1FromDuplicates),
    goToMergeStep2: assign(goToMergeStep2),
    goToMergeStep3: assign(goToMergeStep3),
    backToMergeStep1: assign(backToMergeStep1),
    backToMergeStep2: assign(backToMergeStep2),

    updateLocationList: assign(updateLocationList),
    toggleMergeItem: assign(toggleMergeItem),
    toggleMergeTarget: assign(toggleMergeTarget),
    openDetailModal: assign(openDetailModal),

    queryChange: assign(queryChange),

    getQuery,

    displayRemoveConfirmModal: assign(displayRemoveConfirmModal),
    closeModal: assign(closeModal),
  };
}

export default Object.assign(actions, {
  updateSearchQuery,
  tests: {
    updateEditedLocation,
    addLocation,
    newLocation,
    closeForm,
    closeMerge,
    changeMergeModal,
    toggleMerge,
    toggleMergeItem,
    toggleMergeTarget,
    goToMergeStep1FromDuplicates,
    goToMergeStep2,
    goToMergeStep3,
    backToMergeStep1,
    backToMergeStep2,
    mergeOnGoing,
    openDetailModal,
    updateLocationList,
    editLocation,
    removedLocation,
    getQuery,
    queryChange,
    displayRemoveConfirmModal,
    closeModal,
  }
});
