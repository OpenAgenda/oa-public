import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';
import { Modal } from '@openagenda/react-components';

const log = debug('AdminActionModal');

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
    getLabel: PropTypes.func.isRequired,
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
    const { getLabel } = this.props;
    const { link, hostname } = this.state;
    return (
      <Modal
        title={getLabel('info')}
        onClose={this.onClose}
      >
        <div>
          <p className="text-center">
            {`${getLabel('doOn')} ${hostname}.`}
          </p>
          <p className="text-center">
            {`${getLabel('newtab')}`}
          </p>
          <div className="text-center">
            <a
              href={link}
              className="btn btn-primary"
              target="_blanc"
            >
              {`${getLabel('goTo')} ${hostname}`}
            </a>
          </div>
        </div>
      </Modal>
    );
  }

  renderUnauthorized() {
    const { data, getLabel, close } = this.props;
    return (
      <Modal
        title={getLabel('info')}
        onClose={close}
      >
        <div>
          <p className="text-center">
            {`${getLabel('cantDo')} ${getLabel(data.accessType)}`}
          </p>
          <div className="text-center">
            <button
              type="button"
              className="btn btn-primary margin-top-sm"
              onClick={close}
            >
              {getLabel('closeModal')}
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

export default AdminActionModal;
