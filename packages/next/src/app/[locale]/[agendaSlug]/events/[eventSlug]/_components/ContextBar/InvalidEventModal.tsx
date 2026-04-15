import { useIntl } from 'react-intl';
import { useDisclosure } from '@openagenda/uikit';
import NotificationModal from '@/src/components/NotificationModal';
import { contextBar as messages } from '../../messages';

export interface InvalidEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editLink?: string;
}

export function InvalidEventModal({
  isOpen,
  onClose,
  editLink = '#edit',
}: InvalidEventModalProps) {
  const intl = useIntl();

  return isOpen ? (
    <NotificationModal
      title={intl.formatMessage(messages.invalidEvent)}
      message={intl.formatMessage(messages.invalidEventMessage)}
      onClose={onClose}
      action={intl.formatMessage(messages.fixEvent)}
      onAction={() => {
        window.location.href = editLink;
      }}
    />
  ) : null;
}

export function useInvalidEventModal(editLink: string = '#edit') {
  const disclosure = useDisclosure();

  return {
    ...disclosure,
    modal: (
      <InvalidEventModal
        isOpen={disclosure.open}
        onClose={disclosure.onClose}
        editLink={editLink}
      />
    ),
  };
}
