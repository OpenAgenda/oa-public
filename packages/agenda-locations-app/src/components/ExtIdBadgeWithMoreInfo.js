import { defineMessages, useIntl } from 'react-intl';
import { MoreInfo } from '@openagenda/react-shared';

const messages = defineMessages({
  externalRef: {
    id: 'AgendaLocations.LocationItem.externalRef',
    defaultMessage: 'External reference:',
  },
  extIdActionInfo: {
    id: 'AgendaLocations.LocationItem.extIdActionInfo',
    defaultMessage:
      'This location is linked to data from a database external to OpenAgenda. The associated actions open a tab on your browser allowing the consultation/editing of the data directly on this database.',
  },
});

const Badge = ({ label, value }) => {
  const intl = useIntl();
  return (
    <MoreInfo
      content={(
        <div>
          <p>{`${intl.formatMessage(messages.externalRef)} ${value}`}</p>
          <p>{intl.formatMessage(messages.extIdActionInfo)}</p>
        </div>
      )}
      placement="top"
    >
      <div className="badge badge-sm badge-default margin-right-sm">
        {label}
      </div>
    </MoreInfo>
  );
};

export default Badge;
