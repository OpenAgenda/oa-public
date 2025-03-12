import qs from 'qs';
import { useRouter } from 'next/router';
import { defineMessages, useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import {
  Stack,
  VStack,
  Text,
  Wrap,
  Button,
  Heading,
  useDisclosure,
  NoBreak,
  Link,
} from '@openagenda/uikit';
import { nl2br } from '@openagenda/react-shared';
import { faEnvelope, faPlus } from '@fortawesome/pro-solid-svg-icons';
import { faShareNodes } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'components/Image';
import NextChakraLink from 'components/NextChakraLink';
import OAIcon from 'components/OAIcon';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import useLocationQuery from 'hooks/useLocationQuery';
import { keyCDNLoader } from 'utils/imageLoader';
import hrefWithLang from 'utils/hrefWithLang';
import getSession from 'utils/getSession';
import AggregateModal from './AggregateModal';
import ExportModal, { exportIndexMap } from './ExportModal';

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

function getMailtoUrl(mailtoSettings) {
  if (!mailtoSettings?.enabled || !mailtoSettings.email) return null;

  return `mailto:${mailtoSettings.email}${qs.stringify(
    {
      subject: mailtoSettings.subject,
      body: mailtoSettings.body,
    },
    { addQueryPrefix: true, skipNulls: true },
  )}`;
}

function getImageSrc(src, updatedAt) {
  const url = new URL(src);
  url.searchParams.set('__ts', updatedAt);
  return url.href;
}

export default function AgendaHeader({ agenda }) {
  const isDev = process.env.NODE_ENV === 'development';

  const intl = useIntl();

  const router = useRouter();
  const urlQuery = useLocationQuery();

  const mailtoUrl = getMailtoUrl(agenda.settings.inbox?.mailto);

  const {
    isOpen: aggregateIsOpen,
    onOpen: aggregateOnOpen,
    onClose: aggregateOnClose,
  } = useDisclosure({ defaultIsOpen: urlQuery.displayAggregatorModal === '1' });

  const displayExportModalValue = urlQuery.displayExportModal as string;
  const displayExportModalIndex =
    displayExportModalValue && displayExportModalValue in exportIndexMap
      ? exportIndexMap[displayExportModalValue]
      : -1;

  const {
    isOpen: exportIsOpen,
    onOpen: exportOnOpen,
    onClose: exportOnClose,
  } = useDisclosure({
    defaultIsOpen: Boolean(displayExportModalValue),
    onClose() {
      const url = new URL(router.asPath, 'https://n');
      url.searchParams.delete('displayExportModal');
      router.replace(url.pathname + url.search, null, { shallow: true });
    },
  });

  const [cookies] = useCookies();
  const sessionUser = getSession(cookies)?.user;
  const contactHref = hrefWithLang(
    `/${agenda.slug}/contact`,
    sessionUser ? null : intl.locale,
  );
  const contributeHref = hrefWithLang(
    `/${agenda.slug}/contribute`,
    sessionUser ? null : intl.locale,
  );

  const updatedTs = new Date(agenda.updatedAt).getTime();

  return (
    <Stack spacing="8" direction={{ base: 'column', md: 'row' }} align="center">
      {agenda.image ? (
        <Image
          rounded="full"
          width="140"
          height="140"
          src={getImageSrc(agenda.image, updatedTs)}
          fallbackSrc={
            isDev
              ? `${agenda.image.replace('dev', 'main').replace('images-', 'imagesdev-')}?__ts=${updatedTs}`
              : undefined
          }
          loader={keyCDNLoader}
          priority
          draggable={false}
          alt=""
          border="3px solid white"
          h="140px"
          objectFit="cover"
        />
      ) : null}

      <VStack spacing="3" align={{ base: 'center', md: 'start' }}>
        {agenda.network ? (
          <NextChakraLink href={`/agendas?network=${agenda.network.uid}`}>
            {agenda.network.title}
            &nbsp;›
          </NextChakraLink>
        ) : null}
        <Heading
          as="h1"
          mt={agenda.network ? '0 !important' : undefined}
          fontSize="4xl"
          textAlign={{ base: 'center', md: 'start' }}
        >
          {agenda.title}
          {agenda.official ? (
            <NoBreak>
              <OfficialAgenda ml="4" />
            </NoBreak>
          ) : null}
          {agenda.private ? (
            <NoBreak>
              <LockIcon type="agenda" ml="4" />
            </NoBreak>
          ) : null}
        </Heading>

        <Text>{nl2br(agenda.description)}</Text>

        {agenda.url ? (
          <Link href={agenda.url} target="_blank" rel="noopener nofollow">
            {agenda.url}
          </Link>
        ) : null}

        <Wrap shouldWrapChildren mt="4 !important" justify="center">
          {/* !important to overwrite Stack spacing */}
          <Button
            as={Link}
            href={mailtoUrl || contactHref}
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
          <Button
            as={Link}
            href={contributeHref}
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
            colorScheme="primary"
          >
            {intl.formatMessage(messages.addEvent)}
          </Button>
        </Wrap>
      </VStack>

      {exportIsOpen ? (
        <ExportModal
          isOpen
          onClose={exportOnClose}
          agenda={agenda}
          defaultIndex={displayExportModalIndex}
        />
      ) : null}
      {aggregateIsOpen ? (
        <AggregateModal isOpen onClose={aggregateOnClose} agenda={agenda} />
      ) : null}
    </Stack>
  );
}
