'use strict';

const _ = require('lodash');

const mappings = {
  aggregatorSources: {
    'agendaAdmin.agenda': 'agenda',
    'agendaAdmin.sources': 'sources',
    'agendaAdmin.isLoading': (state, previous) =>
      _.get(state, 'agenda.loading', true) || _.get(state, 'sources.loading', true),
    'agendaAdmin.sections': 'agenda.sections'
  }
};


function getChanges(key, store, layoutStore) {
  const toMap = mappings[key];
  const changes = [];

  if (!toMap) {
    return changes;
  }

  const layoutState = layoutStore.getState();
  const localState = store.getState();

  for (const layoutPath of Object.keys(toMap)) {
    const localPath = toMap[layoutPath];

    const layoutData = _.get(layoutState, layoutPath);
    const localData = typeof localPath === 'function' ? localPath(localState, layoutData) : _.get(localState, localPath);

    if (localData !== layoutData) {
      changes.push([layoutPath, localData]);
    }
  }

  return changes;
}

function updateLayoutStore(key, store, layoutStore) {
  const changes = getChanges(key, store, layoutStore);

  if (changes.length) {
    layoutStore.dispatch({
      type: 'layout/REFLECT_UPDATE',
      changes
    });
  }
}

module.exports = function reflectStoresInLayout(stores, layoutStore) {
  const unsubscribes = Object.keys(stores)
    .map((key) => {
      return stores[key].subscribe(() => updateLayoutStore(key, stores[key], layoutStore))
    });

  return () => unsubscribes.map(unsubscribe => unsubscribe());
}
