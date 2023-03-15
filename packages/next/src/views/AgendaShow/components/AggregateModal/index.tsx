import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
} from '@openagenda/uikit';
import useUser from 'hooks/useUser';
import { FetchStatus } from 'config/types';
import LoadingBody from './LoadingBody';
import UnloggedBody from './UnloggedBody';
import LoggedBody from './LoggedBody';
import messages from './messages';

interface AggregateModalProps {
  isOpen: boolean;
  onClose: () => void;
  agenda: Record<string, any>;
}

function AggregateModalContent({ agenda, user }) {
  if (!user) {
    return <UnloggedBody agenda={agenda} />;
  }

  return <LoggedBody agenda={agenda} />;
}

export default function AggregateModal({
  isOpen,
  onClose: originalOnClose,
  agenda,
}: AggregateModalProps) {
  const intl = useIntl();
  const router = useRouter();

  const { user, status } = useUser();

  // Remove displayAggregatorModal=1 from url
  const onClose = useCallback(() => {
    const url = new URL(router.asPath, 'http://n');

    url.searchParams.delete('displayAggregatorModal');

    router.replace(
      url.pathname + url.search,
      null,
      { shallow: true },
    );
    originalOnClose();
  }, [originalOnClose, router]);

  return (
    <Modal
      size="xl"
      isCentered
      // scrollBehavior="inside"
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          sx={{
            ':has(> .chakra-modal__close-btn)': {
              pr: 12, // https://github.com/chakra-ui/chakra-ui/issues/7256
            },
          }}
        >
          {intl.formatMessage(messages.title)}

          <ModalCloseButton />
        </ModalHeader>

        {status === FetchStatus.Fetching ? (
          <LoadingBody />
        ) : (
          <AggregateModalContent agenda={agenda} user={user} />
        )}
      </ModalContent>
    </Modal>
  );
}
