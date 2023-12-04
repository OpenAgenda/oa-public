import IframeResizer from 'iframe-resizer-react';
import { useIntl } from 'react-intl';
import { Heading, Flex } from '@openagenda/uikit';

const ROOT = process.env.NEXT_PUBLIC_ROOT;

export default function Inbox({ agenda, event }) {
  const intl = useIntl();

  return (
    <div>
      <Heading as="h2" fontSize="2xl" mb="4">Messagerie</Heading>
      <Flex
        display="flex"
        direction="column"
        gap="4"
        position="relative"
        // mt="8"
        // py="4"
        // p="8"
        bg="white"
        // border="1px solid"
        // borderColor="oaGray.100"
        borderRadius="sm"
        // _hover={{
        //   borderColor: 'primary.500',
        // }}
      >
        <IframeResizer
          src={`${ROOT}/${agenda.slug}/events/${event.slug}/embed-inbox?lang=${intl.locale}`}
          style={{ width: '1px', minWidth: '100%' }}
        />
      </Flex>
    </div>
  );
}
