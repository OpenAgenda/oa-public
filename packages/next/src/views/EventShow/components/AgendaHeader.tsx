import NextLink from 'next/link';
import { useIntl } from 'react-intl';
import {
  Box,
  Flex,
  Heading,
  NoBreak,
  Link,
  LinkBox,
  LinkOverlay,
  useBreakpointValue,
} from '@openagenda/uikit';
import Image from 'components/Image';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import { thumborLoader } from 'utils/imageLoader';
import { useAgenda } from '../contexts/agenda';
import { agendaHeader as messages } from '../messages';

const isDev = process.env.NODE_ENV === 'development';

const Network = ({ network, intl }) => (
  <Link asChild color="white">
    <NextLink
      href={`/agendas?network=${network.uid}`}
      aria-label={`${intl.formatMessage(messages.viewNetworkAgendas)} - ${network.title}`}
    >
      {network.title}
      &nbsp;›
    </NextLink>
  </Link>
);

const AgendaLogo = ({ imageSrc }) => (
  <Box
    asChild
    rounded="full"
    border="3px solid white"
    h="56px"
    minW="56px"
    objectFit="cover"
  >
    <Image
      width="56"
      height="56"
      src={imageSrc}
      fallbackSrc={isDev ? imageSrc.replace('dev', 'main') : undefined}
      loader={thumborLoader}
      priority
      draggable={false}
      alt=""
    />
  </Box>
);

const AgendaTitle = ({ title, official, isPrivate }) => (
  <Heading
    as="h1"
    fontSize={{ base: 'xl', md: '2xl' }}
    textAlign={{ base: 'start' }}
  >
    {title}
    {official ? (
      <NoBreak>
        <OfficialAgenda
          ml="4"
          // zIndex + position because of LinkBox
          zIndex="1"
          pos="relative"
        />
      </NoBreak>
    ) : null}
    {isPrivate ? (
      <NoBreak>
        <LockIcon
          type="agenda"
          ml="4"
          // zIndex + position because of LinkBox
          zIndex="1"
          pos="relative"
        />
      </NoBreak>
    ) : null}
  </Heading>
);

const SeeAllEventsLink = ({ agenda, intl, textAlign = 'center' }) => (
  <LinkOverlay asChild textAlign={textAlign}>
    <NextLink href={`/${encodeURIComponent(agenda.slug)}`}>
      {intl.formatMessage(messages.showAllEvents)}
    </NextLink>
  </LinkOverlay>
);

export default function AgendaHeader() {
  const intl = useIntl();
  const agenda = useAgenda();

  const imageSrc = agenda.image
    ? new URL(agenda.image).pathname.replace(/^\//, '')
    : null;

  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  return (
    <LinkBox asChild>
      <Flex
        direction={{ base: 'column' }}
        alignItems={{ base: 'center', md: 'start' }}
        gap={{ base: 2, md: 4 }}
        py={{ base: 2, md: 4 }}
        px={{ md: 5 }}
      >
        {agenda.network && isMobile ? (
          <Box textAlign="center">
            <Network intl={intl} network={agenda.network} />
          </Box>
        ) : null}
        <Flex
          direction={{ base: 'row' }}
          gap={{ base: 3, md: 5 }}
          px={2}
          alignItems="center"
        >
          {imageSrc ? <AgendaLogo imageSrc={imageSrc} /> : null}
          <Flex direction="column" gap={3}>
            {agenda.network && !isMobile ? (
              <Network intl={intl} network={agenda.network} />
            ) : null}
            <AgendaTitle {...agenda} isPrivate={agenda.private} />
            {!isMobile ? (
              <SeeAllEventsLink intl={intl} agenda={agenda} textAlign="left" />
            ) : null}
          </Flex>
        </Flex>

        {isMobile ? <SeeAllEventsLink intl={intl} agenda={agenda} /> : null}
      </Flex>
    </LinkBox>
  );
}
