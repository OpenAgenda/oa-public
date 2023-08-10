import statusMessages from '@openagenda/common-labels/event/statuses';

export default function StatusBadge({ status, intl }) {
  let elem;

  switch (status) {
    case 2:
      elem = (
        <span
          title={intl.formatMessage(statusMessages.rescheduledInfo)}
          className="label label-warning"
        >
          {intl.formatMessage(statusMessages.rescheduled)}
        </span>
      );
      break;
    case 3:
      elem = (
        <span
          title={intl.formatMessage(statusMessages.movedOnlineInfo)}
          className="label label-warning"
        >
          {intl.formatMessage(statusMessages.movedOnline)}
        </span>
      );
      break;
    case 4:
      elem = (
        <span
          title={intl.formatMessage(statusMessages.postponedInfo)}
          className="label label-warning"
        >
          {intl.formatMessage(statusMessages.postponed)}
        </span>
      );
      break;
    case 5:
      elem = (
        <span
          title={intl.formatMessage(statusMessages.fullInfo)}
          className="label label-danger"
        >
          {intl.formatMessage(statusMessages.full)}
        </span>
      );
      break;
    case 6:
      elem = (
        <span
          title={intl.formatMessage(statusMessages.cancelledInfo)}
          className="label label-danger"
        >
          {intl.formatMessage(statusMessages.cancelled)}
        </span>
      );
      break;
    default:
      return null;
  }

  return <span className="padding-right-sm status">{elem}</span>;
}
