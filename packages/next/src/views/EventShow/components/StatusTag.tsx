import { useIntl } from 'react-intl';
import { Tag } from '@openagenda/uikit';
import messages from '@openagenda/common-labels/event/statuses';

export default function StatusTag({ status }) {
  const intl = useIntl();

  switch (status) {
    case 2:
      return (
        <Tag variant="solid" colorScheme="warning">
          {intl.formatMessage(messages.rescheduled)}
        </Tag>
      );
    case 3:
      return (
        <Tag variant="solid" colorScheme="warning">
          En ligne
          {intl.formatMessage(messages.movedOnline)}
        </Tag>
      );
    case 4:
      return (
        <Tag variant="solid" colorScheme="warning">
          {intl.formatMessage(messages.postponed)}
        </Tag>
      );
    case 5:
      return (
        <Tag variant="solid" colorScheme="danger">
          {intl.formatMessage(messages.full)}
        </Tag>
      );
    case 6:
      return (
        <Tag variant="solid" colorScheme="danger">
          {intl.formatMessage(messages.cancelled)}
        </Tag>
      );
    default:
      return null;
  }
}
