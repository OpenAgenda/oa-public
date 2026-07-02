import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Modal, AuthenticateAndConfirm } from '@openagenda/react-shared';

const messages = defineMessages({
  eventsImplication: {
    id: 'AgendaSettings.Components.DeleteAgenda.eventsImplication',
    defaultMessage:
      'The events that have been created in this agenda will also be deleted and be removed from the agendas where they have been shared',
  },
  dataImplication: {
    id: 'AgendaSettings.Components.DeleteAgenda.dataImplication',
    defaultMessage:
      'All associated conversations, activity history and members data will also be deleted',
  },
  confirmButton: {
    id: 'AgendaSettings.Components.DeleteAgenda.confirmButton',
    defaultMessage: 'Confirm deletion',
  },
  verifyAuthenticate: {
    id: 'AgendaSettings.Components.DeleteAgenda.verifyAuthenticate',
    defaultMessage: 'Verify your authentication',
  },
  verifyAuthenticateDetail: {
    id: 'AgendaSettings.Components.DeleteAgenda.verifyAuthenticateDetail',
    defaultMessage:
      'Please authenticate to confirm the deletion of this agenda',
  },
  confirm: {
    id: 'AgendaSettings.Components.DeleteAgenda.confirm',
    defaultMessage: 'Deletion complete',
  },
  confirmDetail: {
    id: 'AgendaSettings.Components.DeleteAgenda.confirmDetail',
    defaultMessage:
      'The agenda was successfully deleted, you will now be redirected to your homepage',
  },
  closeConfirm: {
    id: 'AgendaSettings.Components.DeleteAgenda.closeConfirm',
    defaultMessage: 'Close',
  },
});

function doRedirect(redirectTo) {
  if (!window) return;
  window.location.href = redirectTo;
}

export default function DeleteAgenda(props = {}) {
  const { deleteRes, redirectTo = '/home', step: stepFromProps } = props;
  const intl = useIntl();
  const [step, setStep] = useState(stepFromProps);

  return (
    <>
      {step === 'confirm' ? (
        <Modal
          onClose={() => doRedirect(redirectTo)}
          title={intl.formatMessage(messages.confirm)}
          classNames={{
            title: 'popup-title padding-bottom-z',
          }}
        >
          <p>{intl.formatMessage(messages.confirmDetail)}</p>
          <div className="text-center padding-top-sm">
            <button
              type="button"
              className="btn btn-default"
              onClick={() => doRedirect(redirectTo)}
            >
              {intl.formatMessage(messages.closeConfirm)}
            </button>
          </div>
        </Modal>
      ) : null}
      {step === 'authenticate' ? (
        <Modal
          onClose={() => setStep()}
          title={intl.formatMessage(messages.verifyAuthenticate)}
          classNames={{
            title: 'popup-title padding-bottom-z',
          }}
        >
          <AuthenticateAndConfirm
            method="delete"
            message={intl.formatMessage(messages.verifyAuthenticateDetail)}
            res={deleteRes}
            onSuccess={() => {
              setStep('confirm');
              setTimeout(() => {
                doRedirect(redirectTo);
              }, 3000);
            }}
          />
        </Modal>
      ) : null}
      <ul className="margin-v-md">
        <li className="margin-bottom-sm">
          {intl.formatMessage(messages.eventsImplication)}
        </li>
        <li>{intl.formatMessage(messages.dataImplication)}</li>
      </ul>
      <div className="text-center margin-bottom-sm">
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => setStep('authenticate')}
        >
          {intl.formatMessage(messages.confirmButton)}
        </button>
      </div>
    </>
  );
}
