import qs from 'qs';
import { defineMessages, useIntl } from 'react-intl';
import {
  Stack,
  VStack,
  Text,
  Link,
  Wrap,
  Button,
  Heading,
  useDisclosure,
  NoBreak,
} from '@openagenda/uikit';
import { nl2br } from '@openagenda/react-shared';
import { faEnvelope, faPlus } from '@fortawesome/pro-solid-svg-icons';
import { faShareNodes } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'components/Image';
import NextChakraLink from 'components/NextChakraLink';
import OAIcon from 'components/OAIcon';
import OfficialAgenda from 'components/OfficialAgenda';
import PrivateAgenda from 'components/PrivateAgenda';
import useLocationQuery from 'hooks/useLocationQuery';
import AggregateModal from './AggregateModal';
import ExportModal from './ExportModal';

const messages = defineMessages({
  contact: {
    id: 'next.views.AgendaShow.AgendaHeader.contact',
    defaultMessage: 'Contact',
  },
  officialAgenda: {
    id: 'next.views.AgendaShow.AgendaHeader.officialAgenda',
    defaultMessage: 'Official agenda',
  },
  addEvent: {
    id: 'next.views.AgendaShow.AgendaHeader.addEvent',
    defaultMessage: 'Add an event',
  },
  aggregate: {
    id: 'next.views.AgendaShow.AgendaHeader.aggregate',
    defaultMessage: 'Aggregate',
  },
  export: {
    id: 'next.views.AgendaShow.AgendaHeader.export',
    defaultMessage: 'Export',
  },
});

function simpleLoader({ src }) {
  return src;
}

function getMailtoUrl(mailtoSettings) {
  if (!mailtoSettings?.enabled || !mailtoSettings.email) return null;

  return `mailto:${mailtoSettings.email}${qs.stringify({
    subject: mailtoSettings.subject,
    body: mailtoSettings.body,
  }, { addQueryPrefix: true, skipNulls: true })}`;
}

export default function AgendaHeader({ agenda }) {
  const isDev = process.env.NODE_ENV === 'development';

  const intl = useIntl();

  const urlQuery = useLocationQuery();

  const mailtoUrl = getMailtoUrl(agenda.settings.inbox?.mailto);

  const {
    isOpen: aggregateIsOpen,
    onOpen: aggregateOnOpen,
    onClose: aggregateOnClose,
  } = useDisclosure({ defaultIsOpen: urlQuery.displayAggregatorModal === '1' });

  const {
    isOpen: exportIsOpen,
    onOpen: exportOnOpen,
    onClose: exportOnClose,
  } = useDisclosure({});

  return (
    <Stack spacing="8" direction={{ base: 'column', md: 'row' }} align="center">
      {agenda.image ? (
        <Image
          rounded="full"
          width="140"
          height="140"
          src={agenda.image}
          fallbackSrc={isDev ? agenda.image.replace('cibuldev', 'cibul') : null}
          fallbackStrategy="onError"
          alt=""
          draggable={false}
          loader={simpleLoader}
          border="3px solid white"
          h="140px"
          fit="cover"
        />
      ) : null}

      <VStack spacing="3" align={{ base: 'center', md: 'start' }}>
        <Heading as="h1" fontSize="4xl" textAlign="center">
          {agenda.title}
          {agenda.official ? (
            <NoBreak>
              <OfficialAgenda ml="4" />
            </NoBreak>
          ) : null}
          {agenda.private ? (
            <NoBreak>
              <PrivateAgenda ml="4" />
            </NoBreak>
          ) : null}
        </Heading>

        <Text>{nl2br(agenda.description)}</Text>

        <Link href={agenda.url}>{agenda.url}</Link>

        <Wrap mt="4 !important" justify="center">{/* !important to overwrite Stack spacing */}
          <Button
            as={NextChakraLink}
            href={mailtoUrl || `/${agenda.slug}/contact`}
            leftIcon={<FontAwesomeIcon icon={faEnvelope} />}
            variant="outline"
            colorScheme="white"
            _hover={{
              bg: 'white',
              borderColor: 'white',
              color: 'primary.500',
              textDecoration: 'none',
            }}
          >
            {intl.formatMessage(messages.contact)}
          </Button>
          <Button
            onClick={exportOnOpen}
            leftIcon={<FontAwesomeIcon icon={faShareNodes} />}
            variant="outline"
            colorScheme="white"
            _hover={{
              bg: 'white',
              borderColor: 'white',
              color: 'primary.500',
            }}
          >
            {intl.formatMessage(messages.export)}
          </Button>
          {exportIsOpen ? (
            <ExportModal
              isOpen
              onClose={exportOnClose}
              agendaUid={agenda.uid}
            />
          ) : null}
          <Button
            onClick={aggregateOnOpen}
            leftIcon={<OAIcon />}
            variant="outline"
            colorScheme="white"
            _hover={{
              bg: 'white',
              borderColor: 'white',
              color: 'primary.500',
            }}
          >
            {intl.formatMessage(messages.aggregate)}
          </Button>
          {aggregateIsOpen ? (
            <AggregateModal
              isOpen
              onClose={aggregateOnClose}
              agenda={agenda}
            />
          ) : null}
          <Button
            as={NextChakraLink}
            href={`/${agenda.slug}/contribute`}
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
            colorScheme="primary"
          >
            {intl.formatMessage(messages.addEvent)}
          </Button>
        </Wrap>
      </VStack>
    </Stack>
  );
}
