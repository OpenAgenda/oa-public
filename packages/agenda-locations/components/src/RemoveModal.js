import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';
import { Modal } from '@openagenda/react-components';
import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-locations/list';

const log = debug('RemoveModal');
const getLabel = makeLabelGetter(labels);

class RemoveLocationModal extends Component {
  static propTypes = {
    modal: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
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
    const { onClose, lang } = this.props;
    return (
      <div>
        <p className="text-center">
          {getLabel('removeComplete', lang)}
        </p>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            {getLabel('closeModal', lang)}
          </button>
        </div>
      </div>
    );
  }

  renderNoEventsModal() {
    const { onRemove, lang } = this.props;
    return (
      <div>
        <p className="text-center">
          {getLabel('confirmRemoveMessage', lang)}
        </p>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onRemove()}
          >{getLabel('confirmRemove', lang)}
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
      onRemove,
      lang
    } = this.props;
    const { removeEvents } = this.state;
    const { eventCount, agendaEventCount } = modal.data.location;

    let infoText = (
      <div className="margin-v-sm">
        <p className="text-left">
          {getLabel('cannotRemoveStart', { eventCount }, lang)}
          <a href={seeEventsLink}>
            {getLabel(agendaEventCount === 1 ? 'cannotRemoveLinkUnique' : 'cannotRemoveLink', { agendaEventCount }, lang)}
          </a>
          {getLabel(agendaEventCount === 1 ? 'cannotRemoveEndUnique' : 'cannotRemoveEnd', lang)}
        </p>
      </div>
    );
    if (this.eventCount === this.agendaEventCount) {
      infoText = (
        <span>
          <p className="text-left">
            {getLabel('cannotRemoveStart=', lang)}
            <a href={seeEventsLink}>
              {getLabel(eventCount === 1 ? 'cannotRemoveLinkUnique=' : 'cannotRemoveLink=', { eventCount }, lang)}
            </a>
            {getLabel(eventCount === 1 ? 'cannotRemoveEndUnique=' : 'cannotRemoveEnd=', lang)}
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
            {getLabel(eventCount === 1 ? 'notRemoveUnique' : 'notRemove', { eventCount }, lang)}
            <div className="text-muted">{getLabel(eventCount === 1 ? 'notRemoveInfoUnique' : 'notRemoveInfo')}</div>
          </label>
        </div>
        <div className="radio margin-v-sm">
          <label htmlFor="withEvents" onClick={() => this.setState({ removeEvents: true })}>
            <input type="radio" id="withEvents" name="withEvents" checked={removeEvents === true} />
            {getLabel(eventCount === 1 ? 'removeUnique' : 'removeEvents', { eventCount }, lang)}
          </label>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-default margin-top-sm"
            onClick={onClose}
          >
            {getLabel('cancel', lang)}
          </button>
          <button
            type="button"
            className="btn btn-primary margin-top-sm pull-right"
            onClick={() => onRemove(removeEvents)}
          >
            {getLabel('confirm', lang)}
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { modal, onClose, lang } = this.props;
    const { isRemoved } = modal.data;
    const { eventCount } = modal.data.location;
    let modalStates = isRemoved ? 'removed' : null;
    if (!modalStates) {
      modalStates = eventCount ? 'withEvents' : 'noEvents';
    }

    return (
      <Modal
        title={getLabel('removeTitle', lang)}
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
