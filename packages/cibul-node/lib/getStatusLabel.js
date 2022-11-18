'use strict';

const makeLabelGetter = require('@openagenda/labels');
const eventLabels = require('@openagenda/labels/event/show');

const getLabel = makeLabelGetter(eventLabels);

const statuses = [{
  id: 1,
  label: 'statusScheduled',
}, {
  id: 2,
  label: 'statusRescheduled',
}, {
  id: 3,
  label: 'statusMovedOnline',
}, {
  id: 4,
  label: 'statusPostponed',
}, {
  id: 5,
  label: 'statusFull',
}, {
  id: 6,
  label: 'statusCancelled',
}];

module.exports = function getStatusLabel(status, lang) {
  const matchingLabel = statuses.find(s => s.id === status)?.label ?? 'statusScheduled';

  return getLabel(matchingLabel, lang);
};
