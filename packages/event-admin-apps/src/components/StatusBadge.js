import statusMessages from '@openagenda/common-labels/event/statuses';

const statuses = [
  {
    id: 2,
    slug: 'rescheduled',
    className: 'label label-warning',
  },
  {
    id: 3,
    slug: 'movedOnline',
    className: 'label label-warning',
  },
  {
    id: 4,
    slug: 'postponed',
    className: 'label label-warning',
  },
  {
    id: 5,
    slug: 'full',
    className: 'label label-danger',
  },
  {
    id: 6,
    slug: 'cancelled',
    className: 'label label-danger',
  },
];

export default function StatusBadge({ status, intl }) {
  const { slug, className } = statuses.find(s => s.id === status) ?? {};

  if (!slug) {
    return null;
  }

  return (
    <span className="padding-right-sm status">
      <span
        title={intl.formatMessage(statusMessages[`${slug}Info`])}
        className={className}
      >
        {intl.formatMessage(statusMessages[slug])}
      </span>
    </span>
  );
}
