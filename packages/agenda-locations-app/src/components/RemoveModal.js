import { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Modal } from '@openagenda/react-shared';

const messages = defineMessages({
  removeTitle: {
    id: 'AgendaLocations.RemoveModal.removeTitle',
    defaultMessage: 'Delete a location',
  },
  confirm: {
    id: 'AgendaLocations.RemoveModal.confirm',
    defaultMessage: 'Confirm',
  },
  cancel: {
    id: 'AgendaLocations.RemoveModal.cancel',
    defaultMessage: 'Cancel',
  },
  confirmRemove: {
    id: 'AgendaLocations.RemoveModal.confirmRemove',
    defaultMessage: 'Confirm deletion',
  },
  confirmRemoveMessage: {
    id: 'AgendaLocations.RemoveModal.confirmRemoveMessage',
    defaultMessage: 'The location will be removed from the database',
  },
  closeModal: {
    id: 'AgendaLocations.RemoveModal.closeModal',
    defaultMessage: 'Close',
  },
  removeComplete: {
    id: 'AgendaLocations.RemoveModal.removeComplete',
    defaultMessage: 'The location was removed',
  },
  notRemove: {
    id: 'AgendaLocations.RemoveModal.notRemove',
    defaultMessage: '{count, plural, =0 {nothing} one { Do not delete the event} other {Do not delete # events}}',
  },
  notRemoveInfo: {
    id: 'AgendaLocations.RemoveModal.notRemoveInfo',
    defaultMessage: '{count, plural, =0 {nothing} one {This will continue to display the data of the deleted location until it is updated the next time.} other {These will continue to display the data of the deleted location until their next update.}}',
  },
  removeEvents: {
    id: 'AgendaLocations.RemoveModal.removeEvents',
    defaultMessage: '{count, plural, =0 {nothing} one {Delete the event.} other {Delete the # events.}}',
  },
  infoText: {
    id: 'AgendaLocations.RemoveModal.infoText',
    defaultMessage: 'The location is associated to {eventCount, plural, =0 {nothing} one {one event} other {# events}}, {agendaEventCount, plural, =0 {none of which has been contributed on the agenda.} one {<link>one of which</link> has been contributed on the agenda.} other {<link># of which</link> have been contributed on the agenda.}}',
  },
  infoTextEq: {
    id: 'AgendaLocations.RemoveModal.infoTextEq',
    defaultMessage: 'The location is associated to {eventCount, plural, =0 {nothing} one {<link>one event.</link> By deleting the location, the associated event will also be deleted.} other {<link># events.</link> By deleting the location, the associated events will also be deleted.}}',
  },
});

const RemoveLocationModal = ({
  modal,
  onClose,
  onRemove,
  seeEventsLink,
}) => {
  const [removeEvents, setRemoveEvents] = useState(false);
  const intl = useIntl();
  const { isRemoved } = modal.data;
  const { eventCount, agendaEventCount } = modal.data.location;
  let modalStates = isRemoved ? 'removed' : null;
  if (!modalStates) {
    modalStates = eventCount ? 'withEvents' : 'noEvents';
  }

  const renderRemovedModal = () => (
    <div>
      <p className="text-center">
        <FormattedMessage {...messages.removeComplete} />
      </p>
      <div className="text-center">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onClose}
        >
          <FormattedMessage {...messages.closeModal} />
        </button>
      </div>
    </div>
  );

  const renderNoEventsModal = () => (
    <div>
      <p className="text-center">
        <FormattedMessage {...messages.confirmRemoveMessage} />
      </p>
      <div className="text-center">
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onRemove()}
        >
          <FormattedMessage {...messages.confirmRemove} />
        </button>
      </div>
    </div>
  );

  const renderWithEventsModal = () => {
    let infoText = (
      <div className="margin-bottom-sm">
        <p className="text-left">
          {intl.formatMessage(messages.infoText, { eventCount, agendaEventCount, link: chunks => <a href={seeEventsLink}>{chunks}</a> })}
        </p>
      </div>
    );
    if (eventCount === agendaEventCount) {
      infoText = (
        <span>
          <p>{intl.formatMessage(messages.infoTextEq, { eventCount, link: chunks => <a href={seeEventsLink}>{chunks}</a> })}</p>
        </span>
      );
    }
    return (
      <div className="form-group">
        {infoText}
        <div className="radio margin-v-sm">
          <label htmlFor="withoutEvents">
            <input type="radio" id="withoutEvents" name="withEvents" checked={removeEvents === false} onClick={() => setRemoveEvents(false)} />
            <FormattedMessage values={{ count: eventCount }} {...messages.notRemove} />
            <div className="text-muted"><FormattedMessage values={{ count: eventCount }} {...messages.notRemoveInfo} /></div>
          </label>
        </div>
        <div className="radio margin-v-sm">
          <label htmlFor="withEvents">
            <input type="radio" id="withEvents" name="withEvents" checked={removeEvents === true} onClick={() => setRemoveEvents(true)} />
            <FormattedMessage values={{ count: eventCount }} {...messages.removeEvents} />
          </label>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-default margin-top-sm"
            onClick={onClose}
          >
            <FormattedMessage {...messages.cancel} />
          </button>
          <button
            type="button"
            className="btn btn-primary margin-top-sm pull-right"
            onClick={() => onRemove(removeEvents)}
          >
            <FormattedMessage {...messages.confirm} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      classNames={{ overlay: 'popup-overlay big' }}
      title={intl.formatMessage(messages.removeTitle)}
      onClose={onClose}
    >
      {(() => {
        switch (modalStates) {
          case 'removed':
            return renderRemovedModal();
          case 'noEvents':
            return renderNoEventsModal();
          case 'withEvents':
            return renderWithEventsModal();
          default:
        }
      })()}
    </Modal>
  );
};

export default RemoveLocationModal;
