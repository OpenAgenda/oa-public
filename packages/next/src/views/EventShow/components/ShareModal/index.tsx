import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  Tabs,
  TabPanels,
  TabPanel,
} from '@openagenda/uikit';
import { FetchStatus } from 'config/types';
import useUser from 'hooks/useUser';
import ModalLoadingBody from 'components/ModalLoadingBody';
import { shareModal as messages } from '../../messages';
import ShareOnOA from './ShareOnOA';
import UnloggedBody from './UnloggedBody';
import OtherShares from './OtherShares';

function ShareModalBody({ agenda, event, contentLocale, onClose, onEmailSent }) {
  const intl = useIntl();
  const { user } = useUser();

  return (
    <ModalBody p="0">
      <Tabs
        isLazy
        colorScheme="primary"
        defaultIndex={event.state === 2 ? 1 : 0}
      >
        {event.state === 2 ? (
          <TabList>
            <Tab flex="1">{intl.formatMessage(messages.onOA)}</Tab>
            <Tab flex="1">{intl.formatMessage(messages.others)}</Tab>
          </TabList>
        ) : null}
        <TabPanels>
          <TabPanel>
            {user ? (
              <ShareOnOA agenda={agenda} event={event} />
            ) : (
              <UnloggedBody />
            )}
          </TabPanel>
          <TabPanel>
            <OtherShares contentLocale={contentLocale} onClose={onClose} onEmailSent={onEmailSent} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ModalBody>
  );
}

export default function ShareModal({
  isOpen,
  onClose: originalOnClose,
  agenda,
  event,
  contentLocale,
  onEmailSent,
}) {
  const intl = useIntl();
  const router = useRouter();
  const { status } = useUser();

  // Remove sharemodal=1 from url
  const onClose = useCallback(() => {
    const url = new URL(router.asPath, 'https://n');

    url.searchParams.delete('sharemodal');

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
      // isCentered
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
          {intl.formatMessage(messages.share)}
          <ModalCloseButton />
        </ModalHeader>

        {status === FetchStatus.Fetching ? (
          <ModalLoadingBody />
        ) : (
          <ShareModalBody
            agenda={agenda}
            event={event}
            contentLocale={contentLocale}
            onClose={onClose}
            onEmailSent={onEmailSent}
          />
        )}
      </ModalContent>
    </Modal>
  );
}
