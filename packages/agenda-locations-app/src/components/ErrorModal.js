
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Modal } from '@openagenda/react-shared';

const messages = defineMessages({
  somethingWentWrong: {
    id: 'AgendaLocations.ErrorModal.somethingWentWrong',
    defaultMessage: 'Oops, Something went wrong. Please try again later',
  },
  contactSupportMessage: {
    id: 'AgendaLocations.ErrorModal.contactSupportMessage',
    defaultMessage: 'Please contact support if it happens again',
  },

  contactSupport: {
    id: 'AgendaLocations.ErrorModal.contactSupport',
    defaultMessage: 'Contact support',
  },
});

const ErrorModal = ({
  error,
  close,
}) => {
  const intl = useIntl();
  return (
    <Modal
      onClose={close}
    >
      <div className="text-center">
        <p>{intl.formatMessage(messages.somethingWentWrong)}</p>
        <p>{intl.formatMessage(messages.contactSupportMessage)}</p>
        <a href={`/support?origin=${encodeURIComponent(window.location.pathname)}`} className="btn btn-primary">
          <FormattedMessage {...messages.contactSupport} />
        </a>
      </div>
    </Modal>
  );
};

export default ErrorModal;
