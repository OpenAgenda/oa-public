import { Badge } from '@openagenda/uikit';
import { Tooltip } from '@openagenda/uikit/snippets';

import messages from '@openagenda/common-labels/event/statuses';

const map = [
  {
    id: 1,
    slug: 'scheduled',
    colorPalette: 'green',
  },
  {
    id: 2,
    slug: 'rescheduled',
    colorPalette: 'warning',
  },
  {
    id: 3,
    slug: 'movedOnline',
    colorPalette: 'warning',
  },
  {
    id: 4,
    slug: 'postponed',
    colorPalette: 'warning',
  },
  {
    id: 5,
    slug: 'full',
    colorPalette: 'red',
  },
  {
    id: 6,
    slug: 'cancelled',
    colorPalette: 'red',
  },
];

export function EventStatusBadge({ intl, status }) {
  const { slug, colorPalette } = map.find((i) => i.id === status);
  return (
    <Badge
      colorPalette={colorPalette}
      variant="solid"
      mr="2"
      verticalAlign="middle"
    >
      {intl.formatMessage(messages[slug])}
    </Badge>
  );
}

export function EventStatusTooltip({ intl, status, children }) {
  const { slug } = map.find((i) => i.id === status);
  return (
    <Tooltip
      disabled={status === 1}
      content={intl.formatMessage(messages[`${slug}Info`])}
      openDelay={0}
      closeDelay={0}
    >
      {children}
    </Tooltip>
  );
}
