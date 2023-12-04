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
import ShareOnOA from './ShareOnOA';
import UnloggedBody from './UnloggedBody';
import OtherShares from './OtherShares';

function ShareModalBody({ agenda, event, contentLocale }) {
  const { user } = useUser();

  return (
    <ModalBody p="0">
      <Tabs isLazy colorScheme="primary">
        <TabList>
          <Tab flex="1">Sur OpenAgenda</Tab>
          <Tab flex="1">Autres</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {user ? (
              <ShareOnOA agenda={agenda} event={event} />
            ) : (
              <UnloggedBody />
            )}
          </TabPanel>
          <TabPanel>
            <OtherShares contentLocale={contentLocale} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ModalBody>
  );
}

export default function ShareModal({
  isOpen,
  onClose,
  agenda,
  event,
  contentLocale,
}) {
  const { status } = useUser();

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
          Partager
          <ModalCloseButton />
        </ModalHeader>

        {status === FetchStatus.Fetching ? (
          <ModalLoadingBody />
        ) : (
          <ShareModalBody agenda={agenda} event={event} contentLocale={contentLocale} />
        )}
      </ModalContent>
    </Modal>
  );
}
