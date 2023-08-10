import {
  Badge,
  Tooltip,
} from '@openagenda/uikit';

import messages from '@openagenda/common-labels/event/statuses';

const map = [{
  id: 1,
  slug: 'statusScheduled',
  colorScheme: 'green',
}, {
  id: 2,
  slug: 'statusRescheduled',
  colorScheme: 'warning',
}, {
  id: 3,
  slug: 'statusMovedOnline',
  colorScheme: 'warning',
}, {
  id: 4,
  slug: 'statusPostponed',
  colorScheme: 'warning',
}, {
  id: 5,
  slug: 'statusFull',
  colorScheme: 'red',
}, {
  id: 6,
  slug: 'statusCancelled',
  colorScheme: 'red',
}];

export function EventStatusBadge({ intl, status }) {
  const { slug, colorScheme } = map.find(i => i.id === status);
  return (
    <Badge colorScheme={colorScheme} variant="solid">
      {intl.formatMessage(messages[slug])}
    </Badge>
  );
}

export function EventStatusTooltip({ intl, status, children }) {
  const { slug } = map.find(i => i.id === status);
  return (
    <Tooltip
      isDisabled={status === 1}
      label={intl.formatMessage(messages[`${slug}Info`])}
    >
      {children}
    </Tooltip>
  );
}
