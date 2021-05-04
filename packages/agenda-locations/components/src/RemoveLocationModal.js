import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';
import { Modal } from '@openagenda/react-components';
import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-locations/list';

const log = debug('RemoveLocationModal');
const getLabel = makeLabelGetter(labels);

class RemoveLocationModal extends Component {
  static propTypes = {
    modal: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    seeEventsLink: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      removeEvents: false
    };
  }

  renderRemovedModal() {
    const { onClose } = this.props;
    return (
      <div>
        <p className="text-center">
          {getLabel('removeComplete')}
        </p>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            {getLabel('closeModal')}
          </button>
        </div>
      </div>
    );
  }

  renderNoEventsModal() {
    const { onRemove } = this.props;
    return (
      <div>
        <p className="text-center">
          {getLabel('confirmRemoveMessage')}
        </p>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onRemove()}
          >{getLabel('confirmRemove')}
          </button>
        </div>
      </div>
    );
  }

  renderWithEventsModal() {
    const {
      modal,
      seeEventsLink,
      onClose,
      onRemove
    } = this.props;
    const { removeEvents } = this.state;
    const { eventCount, agendaEventCount } = modal.data.location;

    let infoText = (
      <div className="margin-v-sm">
        <p className="text-left">
          {getLabel('cannotRemoveStart', { eventCount })}
          <a href={seeEventsLink}>
            {getLabel(agendaEventCount === 1 ? 'cannotRemoveLinkUnique' : 'cannotRemoveLink', { agendaEventCount })}
          </a>
          {getLabel(agendaEventCount === 1 ? 'cannotRemoveEndUnique' : 'cannotRemoveEnd')}
        </p>
      </div>
    );
    if (this.eventCount === this.agendaEventCount) {
      infoText = (
        <span>
          <p className="text-left">
            {getLabel('cannotRemoveStart=')}
            <a href={seeEventsLink}>
              {getLabel(eventCount === 1 ? 'cannotRemoveLinkUnique=' : 'cannotRemoveLink=', { eventCount })}
            </a>
            {getLabel(eventCount === 1 ? 'cannotRemoveEndUnique=' : 'cannotRemoveEnd=')}
          </p>
        </span>
      );
    }
    return (
      <div className="form-group margin-v-sm">
        {infoText}
        <div className="radio margin-v-sm">
          <label htmlFor="withoutEvents" onClick={() => this.setState({ removeEvents: false })}>
            <input type="radio" id="withoutEvents" name="withEvents" checked={removeEvents === false} />
            {getLabel(eventCount === 1 ? 'notRemoveUnique' : 'notRemove', { eventCount })}
            <div className="text-muted">{getLabel(eventCount === 1 ? 'notRemoveInfoUnique' : 'notRemoveInfo')}</div>
          </label>
        </div>
        <div className="radio margin-v-sm">
          <label htmlFor="withEvents" onClick={() => this.setState({ removeEvents: true })}>
            <input type="radio" id="withEvents" name="withEvents" checked={removeEvents === true} />
            {getLabel(eventCount === 1 ? 'removeUnique' : 'removeEvents', { eventCount })}
          </label>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-default margin-top-sm"
            onClick={onClose}
          >
            {getLabel('cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary margin-top-sm pull-right"
            onClick={() => onRemove(removeEvents)}
          >
            {getLabel('confirm')}
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { modal, onClose } = this.props;
    const { isRemoved } = modal.data;
    const { eventCount } = modal.data.location;
    let modalStates = isRemoved ? 'removed' : null;
    if (!modalStates) {
      modalStates = eventCount ? 'withEvents' : 'noEvents';
    }

    return (
      <Modal
        title={getLabel('removeTitle')}
        onClose={onClose}
      >
        {(() => {
          switch (modalStates) {
            case 'removed':
              return this.renderRemovedModal();
            case 'noEvents':
              return this.renderNoEventsModal();
            case 'withEvents':
              return this.renderWithEventsModal();
            default:
          }
        })()}
      </Modal>
    );
  }
}

export default RemoveLocationModal;
