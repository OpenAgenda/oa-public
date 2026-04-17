'use client';

import qs from 'qs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  ClientOnly,
} from '@openagenda/uikit';
import { AgendaExportModal } from '@openagenda/react';
import { nl2br } from '@openagenda/react-shared';
import { faEnvelope, faPlus } from '@/src/icons/solid';
import { faShareNodes } from '@/src/icons/regular';
import { FaIcon } from '@/src/icons';
import Image from '@/src/components/Image';
import OAIcon from '@/src/components/OAIcon';
import OfficialAgenda from '@/src/components/OfficialAgenda';
import LockIcon from '@/src/components/LockIcon';
import useAppLocationQuery from '@/src/utils/useAppLocationQuery';
import { thumborLoader } from '@/src/utils/imageLoader';
import hrefWithLang from '@/src/utils/hrefWithLang';
import getSession from '@/src/utils/getSession';
import AggregateModal from './AggregateModal';

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = useAppLocationQuery();

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
      const params = new URLSearchParams(searchParams.toString());
      params.delete('displayExportModal');
      const search = params.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
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

      <ClientOnly>
        {exportIsOpen ? (
          <AgendaExportModal
            isOpen
            onClose={exportOnClose}
            agenda={agenda}
            query={urlQuery}
            defaultValue={displayExportModalValue}
            rootUrl={process.env.NEXT_PUBLIC_ROOT}
            apiRootUrl={process.env.NEXT_PUBLIC_API_ROOT}
          />
        ) : null}
        {aggregateIsOpen ? (
          <AggregateModal isOpen onClose={aggregateOnClose} agenda={agenda} />
        ) : null}
      </ClientOnly>
    </Stack>
  );
}
