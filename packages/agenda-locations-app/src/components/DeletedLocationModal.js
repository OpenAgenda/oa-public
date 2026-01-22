import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Modal } from '@openagenda/react-shared';

const messages = defineMessages({
  locationDeleted: {
    id: 'AgendaLocations.DeletedLocationModal.locationDeleted',
    defaultMessage: 'This location has been deleted',
  },
  locationMerged: {
    id: 'AgendaLocations.DeletedLocationModal.locationMerged',
    defaultMessage: 'This location has been merged into another location',
  },
  goToMergedLocationEdit: {
    id: 'AgendaLocations.DeletedLocationModal.goToMergedLocationEdit',
    defaultMessage: 'Go to the merged location',
  },
  goToMergedLocationDetail: {
    id: 'AgendaLocations.DeletedLocationModal.goToMergedLocationDetail',
    defaultMessage: 'View the merged location',
  },
  goBackToList: {
    id: 'AgendaLocations.DeletedLocationModal.goBackToList',
    defaultMessage: 'Go back to the list',
  },
});

const DeletedLocationModal = ({ close, mergedIn, prefix, mode = 'edit' }) => {
  const intl = useIntl();
  const history = useHistory();
  const isMerged = mergedIn !== null && mergedIn !== undefined;

  const goToMergedLocation = () => {
    const path = mode === 'edit' ? `${prefix}/${mergedIn}/edit` : `${prefix}/${mergedIn}`;
    history.push(path);
  };

  const buttonMessage = mode === 'edit'
    ? messages.goToMergedLocationEdit
    : messages.goToMergedLocationDetail;

  return (
    <Modal onClose={close}>
      <div className="text-center">
        <p>
          {isMerged
            ? intl.formatMessage(messages.locationMerged)
            : intl.formatMessage(messages.locationDeleted)}
        </p>
        <div className="margin-top-sm">
          {isMerged && (
            <button
              type="button"
              className="btn btn-primary margin-right-xs"
              onClick={goToMergedLocation}
            >
              <FormattedMessage {...buttonMessage} />
            </button>
          )}
          <button type="button" className="btn btn-default" onClick={close}>
            <FormattedMessage {...messages.goBackToList} />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeletedLocationModal;
