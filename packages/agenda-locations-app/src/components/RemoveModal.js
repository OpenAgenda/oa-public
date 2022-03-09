import React, { useState } from 'react';
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
  cannotRemoveStart: {
    id: 'AgendaLocations.RemoveModal.cannotRemoveStart',
    defaultMessage: '{count, plural, =0 {nothing} one {The location is associated to one event,} other {The location is associated to # events,}}',
  },
  cannotRemoveLink: {
    id: 'AgendaLocations.RemoveModal.cannotRemoveLink',
    defaultMessage: '{count, plural, =0 {nothing} one { one of which} other { # of which}}',
  },
  cannotRemoveEnd: {
    id: 'AgendaLocations.RemoveModal.cannotRemoveEnd',
    defaultMessage: '{count, plural, =0 {nothing} one { has been contributed on the agenda.} other { have been contributed on the agenda. By deleting the location, the associated events will also be deleted.}}',
  },
  cannotRemoveStartEq: {
    id: 'AgendaLocations.RemoveModal.cannotRemoveStartEq',
    defaultMessage: 'The location is associated to ',
  },
  cannotRemoveLinkEq: {
    id: 'AgendaLocations.RemoveModal.cannotRemoveLinkEq',
    defaultMessage: '{count, plural, =0 {nothing} one {one event.} other {# events.}}',
  },
  cannotRemoveEndEq: {
    id: 'AgendaLocations.RemoveModal.cannotRemoveEndEq',
    defaultMessage: '{count, plural, =0 {nothing} one { By deleting the location, the associated event will also be deleted.} other { By deleting the location, the associated events will also be deleted.}}',
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
});

const RemoveLocationModal = ({
  modal,
  onClose,
  onRemove,
  seeEventsLink
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
      <div className="margin-v-sm">
        <p className="text-left">
          <FormattedMessage values={{ count: eventCount }} {...messages.cannotRemoveStart} />
          <a href={seeEventsLink}>
            <FormattedMessage values={{ count: agendaEventCount }} {...messages.cannotRemoveLink} />
          </a>
          <FormattedMessage values={{ count: agendaEventCount }} {...messages.cannotRemoveEnd} />
        </p>
      </div>
    );
    if (eventCount === agendaEventCount) {
      infoText = (
        <span>
          <p className="text-left">
            <FormattedMessage {...messages.cannotRemoveStartEq} />
            <a href={seeEventsLink}>
              <FormattedMessage values={{ count: eventCount }} {...messages.cannotRemoveLinkEq} />
            </a>
            <FormattedMessage values={{ count: eventCount }} {...messages.cannotRemoveEndEq} />
          </p>
        </span>
      );
    }
    return (
      <div className="form-group margin-v-sm">
        {infoText}
        <div className="radio margin-v-sm">
          <label htmlFor="withoutEvents" onClick={() => setRemoveEvents(false)}>
            <input type="radio" id="withoutEvents" name="withEvents" checked={removeEvents === false} />
            <FormattedMessage values={{ count: eventCount }} {...messages.notRemove} />
            <div className="text-muted"><FormattedMessage values={{ count: eventCount }} {...messages.notRemoveInfo} /></div>
          </label>
        </div>
        <div className="radio margin-v-sm">
          <label htmlFor="withEvents" onClick={() => setRemoveEvents(true)}>
            <input type="radio" id="withEvents" name="withEvents" checked={removeEvents === true} />
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
