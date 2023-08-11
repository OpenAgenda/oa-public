import {
  Badge,
  Tooltip,
} from '@openagenda/uikit';

import messages from '@openagenda/common-labels/event/statuses';

const map = [{
  id: 1,
  slug: 'scheduled',
  colorScheme: 'green',
}, {
  id: 2,
  slug: 'rescheduled',
  colorScheme: 'warning',
}, {
  id: 3,
  slug: 'movedOnline',
  colorScheme: 'warning',
}, {
  id: 4,
  slug: 'postponed',
  colorScheme: 'warning',
}, {
  id: 5,
  slug: 'full',
  colorScheme: 'red',
}, {
  id: 6,
  slug: 'cancelled',
  colorScheme: 'red',
}];

export function EventStatusBadge({ intl, status }) {
  const { slug, colorScheme } = map.find(i => i.id === status);
  return (
    <Badge colorScheme={colorScheme} variant="solid" mr="2" py="0.75">
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
