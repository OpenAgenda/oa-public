import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';
import Modal from '@openagenda/react-shared/src/components/Modal';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

const log = debug('AdminActionModal');

const messages = defineMessages({
  info: {
    id: 'AgendaLocations.AdminActionModal.info',
    defaultMessage: 'Information',
  },
  doOn: {
    id: 'AgendaLocations.AdminActionModal.doOn',
    defaultMessage: 'This action is to be carried out on the website of',
  },
  cantDo: {
    id: 'AgendaLocations.AdminActionModal.cantDo',
    defaultMessage: 'You do not have the rights for:',
  },
  newTab: {
    id: 'AgendaLocations.AdminActionModal.newTab',
    defaultMessage: 'A new tab will open in an instant.',
  },
  goTo: {
    id: 'AgendaLocations.AdminActionModal.goTo',
    defaultMessage: 'Go to',
  },
  closeModal: {
    id: 'AgendaLocations.AdminActionModal.closeModal',
    defaultMessage: 'Close',
  },
  edit: {
    id: 'AgendaLocations.AdminActionModal.edit',
    defaultMessage: 'Edit',
  },
  create: {
    id: 'AgendaLocations.AdminActionModal.create',
    defaultMessage: 'Add a location',
  },
  remove: {
    id: 'AgendaLocations.AdminActionModal.remove',
    defaultMessage: 'Delete',
  },
  merge: {
    id: 'AgendaLocations.AdminActionModal.merge',
    defaultMessage: 'Merge locations',
  },
});

const actionMap = {
  edit: 'update',
  create: 'create',
  remove: 'delete',
  merge: 'merge'
};

const isExternal = (data, settings) => settings.access[actionMap[data.accessType]].external;

const replacer = (tpl, d) => (tpl.replace(/\{([^)]+)?\}/g, ($1, $2) => d[$2]));

const buildActionLink = (settings, data) => replacer(settings.access[actionMap[data.accessType]].link, data.location);

class AdminActionModal extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    close: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    const modalType = isExternal(props.data, props.settings) ? 'external' : 'unauthorized';

    this.state = {
      modalType
    };

    if (modalType === 'external') {
      const link = buildActionLink(props.settings, props.data);
      const hostname = props.settings.access[actionMap[props.data.accessType]].serviceLabel;
      const timeOut = setTimeout(() => {
        const win = window.open(link, '_blank');
        win.focus();
      }, 2500);
      this.state = {
        modalType,
        link,
        hostname,
        timeOut
      };
    }
    this.onClose = this.onClose.bind(this);
  }

  onClose() {
    const { close } = this.props;
    const { timeOut } = this.state;
    if (timeOut) {
      clearTimeout(timeOut);
    }
    close();
  }

  renderRedirect() {
    const { intl } = this.props;
    const { link, hostname } = this.state;
    return (
      <Modal
        title={intl.formatMessage(messages.info)}
        onClose={this.onClose}
      >
        <div>
          <p className="text-center">
            {`${intl.formatMessage(messages.doOn)} ${hostname}.`}
          </p>
          <p className="text-center">
            {`${intl.formatMessage(messages.newTab)}`}
          </p>
          <div className="text-center">
            <a
              href={link}
              className="btn btn-primary"
              target="_blanc"
            >
              {`${intl.formatMessage(messages.goTo)} ${hostname}`}
            </a>
          </div>
        </div>
      </Modal>
    );
  }

  renderUnauthorized() {
    const { data, close, intl } = this.props;
    return (
      <Modal
        title={intl.formatMessage(messages.info)}
        onClose={close}
      >
        <div>
          <p className="text-center">
            {`${intl.formatMessage(messages.cantDo)} ${intl.formatMessage(messages[data.accessType])}`}
          </p>
          <div className="text-center">
            <button
              type="button"
              className="btn btn-primary margin-top-sm"
              onClick={close}
            >
              <FormattedMessage {...messages.closeModal} />
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  render() {
    const { modalType } = this.state;
    if (modalType === 'external') {
      return this.renderRedirect();
    }
    return this.renderUnauthorized();
  }
}

export default injectIntl(AdminActionModal);
