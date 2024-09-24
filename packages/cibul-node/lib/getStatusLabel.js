import makeLabelGetter from '@openagenda/labels';
import eventLabels from '@openagenda/labels/event/show.js';

const getLabel = makeLabelGetter(eventLabels);

const statuses = [
  {
    id: 1,
    label: 'statusScheduled',
  },
  {
    id: 2,
    label: 'statusRescheduled',
  },
  {
    id: 3,
    label: 'statusMovedOnline',
  },
  {
    id: 4,
    label: 'statusPostponed',
  },
  {
    id: 5,
    label: 'statusFull',
  },
  {
    id: 6,
    label: 'statusCancelled',
  },
];

export default function getStatusLabel(status, lang) {
  const matchingLabel = statuses.find((s) => s.id === status)?.label ?? 'statusScheduled';

  return getLabel(matchingLabel, lang);
}
