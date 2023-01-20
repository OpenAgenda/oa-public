import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Modal } from '@openagenda/react-shared';

const messages = defineMessages({
  info: {
    id: 'AgendaLocations.AccessModal.info',
    defaultMessage: 'Information',
  },
  doOn: {
    id: 'AgendaLocations.AccessModal.doOn',
    defaultMessage: 'This action is to be carried out on the website of',
  },
  cantDo: {
    id: 'AgendaLocations.AccessModal.cantDo',
    defaultMessage: 'You do not have the rights for:',
  },
  newTab: {
    id: 'AgendaLocations.AccessModal.newTab',
    defaultMessage: 'A new tab will open in an instant.',
  },
  goTo: {
    id: 'AgendaLocations.AccessModal.goTo',
    defaultMessage: 'Go to',
  },
  closeModal: {
    id: 'AgendaLocations.AccessModal.closeModal',
    defaultMessage: 'Close',
  },
  edit: {
    id: 'AgendaLocations.AccessModal.edit',
    defaultMessage: 'Edit',
  },
  create: {
    id: 'AgendaLocations.AccessModal.create',
    defaultMessage: 'Add a location',
  },
  remove: {
    id: 'AgendaLocations.AccessModal.remove',
    defaultMessage: 'Delete',
  },
  merge: {
    id: 'AgendaLocations.AccessModal.merge',
    defaultMessage: 'Merge locations',
  },
});

const actionMap = {
  edit: 'update',
  create: 'create',
  remove: 'delete',
  merge: 'merge'
};

const isExternal = (data, settings) => settings.access[actionMap[data]].external;
const replacer = (tpl, d) => (tpl.replace(/\{([^)]+)?\}/g, ($1, $2) => d[$2]));
const buildActionLink = (settings, data, location) => replacer(settings.access[actionMap[data]].link, location);

const AccessModal = ({
  action,
  close,
  settings,
  location = null
}) => {
  const intl = useIntl();
  const modalType = isExternal(action, settings) ? 'external' : 'unauthorized';

  if (modalType === 'external') {
    const hostname = settings.access[actionMap[action]].serviceLabel;
    const link = buildActionLink(settings, action, location);
    const timeOut = setTimeout(() => {
      const win = window.open(link, '_blank');
      win.focus();
    }, 2500);

    const onClose = () => {
      if (timeOut) {
        clearTimeout(timeOut);
      }
      close();
    };

    return (
      <Modal
        title={intl.formatMessage(messages.info)}
        onClose={onClose}
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
              target="_blank"
            >
              {`${intl.formatMessage(messages.goTo)} ${hostname}`}
            </a>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={intl.formatMessage(messages.info)}
      onClose={close}
    >
      <div>
        <p className="text-center">
          {`${intl.formatMessage(messages.cantDo)} ${intl.formatMessage(messages[action])}`}
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
};

export default AccessModal;
