import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Modal } from '@openagenda/react-shared';

const messages = defineMessages({
  locationNotFound: {
    id: 'AgendaLocations.NotFoundLocationModal.locationNotFound',
    defaultMessage: 'This location was not found',
  },
  invalidLocationUid: {
    id: 'AgendaLocations.NotFoundLocationModal.invalidLocationUid',
    defaultMessage:
      'The location identifier is invalid or the location does not exist',
  },
  goBackToList: {
    id: 'AgendaLocations.NotFoundLocationModal.goBackToList',
    defaultMessage: 'Go back to the list',
  },
});

const NotFoundLocationModal = ({ close }) => {
  const intl = useIntl();

  return (
    <Modal onClose={close}>
      <div className="text-center">
        <p>{intl.formatMessage(messages.locationNotFound)}</p>
        <p>{intl.formatMessage(messages.invalidLocationUid)}</p>
        <div className="margin-top-sm">
          <button type="button" className="btn btn-default" onClick={close}>
            <FormattedMessage {...messages.goBackToList} />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NotFoundLocationModal;
