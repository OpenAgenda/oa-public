import qs from 'qs';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { defineMessages, useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import {
  Box,
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
import { faEnvelope, faPlus } from 'icons/solid';
import { faShareNodes } from 'icons/regular';
import { FaIcon } from 'icons';
import Image from 'components/Image';
import OAIcon from 'components/OAIcon';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import useLocationQuery from 'hooks/useLocationQuery';
import { thumborLoader } from 'utils/imageLoader';
import hrefWithLang from 'utils/hrefWithLang';
import getSession from 'utils/getSession';
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

export default function AgendaHeader({ agenda }) {
  const isDev = process.env.NODE_ENV === 'development';

  const intl = useIntl();

  const router = useRouter();
  const urlQuery = useLocationQuery();

  const mailtoUrl = getMailtoUrl(agenda.settings.inbox?.mailto);

  const {
    open: aggregateIsOpen,
    onOpen: aggregateOnOpen,
    onClose: aggregateOnClose,
  } = useDisclosure({ defaultOpen: urlQuery.displayAggregatorModal === '1' });

  const displayExportModalValue = urlQuery.displayExportModal as string;

  const {
    open: exportIsOpen,
    onOpen: exportOnOpen,
    onClose: exportOnClose,
  } = useDisclosure({
    defaultOpen: Boolean(displayExportModalValue),
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

  const imageSrc = agenda.image
    ? new URL(agenda.image).pathname.replace(/^\//, '')
    : null;

  return (
    <Stack gap="8" direction={{ base: 'column', md: 'row' }} align="center">
      {agenda.image ? (
        <Box
          asChild
          border="3px solid white"
          h="140px"
          minW="140px"
          objectFit="cover"
          borderRadius="full"
        >
          <Image
            width="140"
            height="140"
            src={imageSrc}
            fallbackSrc={isDev ? imageSrc.replace('dev', 'main') : undefined}
            loader={thumborLoader}
            priority
            draggable={false}
            alt=""
          />
        </Box>
      ) : null}

      <VStack gap="3" align={{ base: 'center', md: 'start' }}>
        {agenda.network ? (
          <Link asChild color="white">
            <NextLink href={`/agendas?network=${agenda.network.uid}`}>
              {agenda.network.title}
              &nbsp;›
            </NextLink>
          </Link>
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
          <Link
            href={agenda.url}
            target="_blank"
            rel="noopener nofollow"
            color="white"
          >
            {agenda.url}
          </Link>
        ) : null}

        <Wrap mt="3" justify="center">
          <Button
            asChild
            variant="outline"
            color="white"
            borderColor="white"
            _hover={{
              bg: 'white',
              borderColor: 'white',
              color: 'primary.500',
              textDecoration: 'none',
            }}
          >
            <Link unstyled href={mailtoUrl || contactHref}>
              <FaIcon icon={faEnvelope} />
              {intl.formatMessage(messages.contact)}
            </Link>
          </Button>
          <Button
            onClick={exportOnOpen}
            variant="outline"
            color="white"
            borderColor="white"
            _hover={{
              bg: 'white',
              borderColor: 'white',
              color: 'primary.500',
            }}
          >
            <FaIcon icon={faShareNodes} />
            {intl.formatMessage(messages.export)}
          </Button>
          <Button
            onClick={aggregateOnOpen}
            variant="outline"
            color="white"
            borderColor="white"
            _hover={{
              bg: 'white',
              borderColor: 'white',
              color: 'primary.500',
            }}
          >
            <OAIcon size="sm" />
            {intl.formatMessage(messages.aggregate)}
          </Button>
          <Button asChild>
            <Link unstyled href={contributeHref}>
              <FaIcon icon={faPlus} />
              {intl.formatMessage(messages.addEvent)}
            </Link>
          </Button>
        </Wrap>
      </VStack>

      {exportIsOpen ? (
        <ExportModal
          isOpen
          onClose={exportOnClose}
          agenda={agenda}
          defaultValue={displayExportModalValue}
        />
      ) : null}
      {aggregateIsOpen ? (
        <AggregateModal isOpen onClose={aggregateOnClose} agenda={agenda} />
      ) : null}
    </Stack>
  );
}
