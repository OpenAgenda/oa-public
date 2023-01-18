import { Modal } from '@openagenda/react-shared';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'AgendaSchema.AfterRedirectModal.title',
    defaultMessage: 'Information',
  },
  body: {
    id: 'AgendaSchema.AfterRedirectModal.body',
    defaultMessage: 'Member form configuration is not activated on your calendar',
  },
  memberInfoAsk: {
    id: 'AgendaSchema.EmbedSelection.memberInfoAsk',
    defaultMessage: 'Ask for activation',
  },
});

const AModal = ({
  close,
}) => {
  const intl = useIntl();
  return (
    <Modal
      title={intl.formatMessage(messages.title)}
      onClose={close}
    >
      <div>
        <p>{intl.formatMessage(messages.body)}</p>
        <a href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=memberSchema`}> {intl.formatMessage(messages.memberInfoAsk)}</a>
      </div>
    </Modal>
  );
};

export default AModal;
