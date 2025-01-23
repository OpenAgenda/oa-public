import { useIntl } from 'react-intl';
import { Heading, NoBreak, Stack, VStack, LinkBox } from '@openagenda/uikit';
import Image from 'components/Image';
import NextChakraLink from 'components/NextChakraLink';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import NextChakraLinkOverlay from 'components/NextChakraLinkOverlay';
import { keyCDNLoader } from 'utils/imageLoader';
import { useAgenda } from '../contexts/agenda';
import { agendaHeader as messages } from '../messages';

const isDev = process.env.NODE_ENV === 'development';

function getImageSrc(src, updatedAt) {
  const url = new URL(src);
  url.searchParams.set('__ts', updatedAt);
  return url.href;
}

export default function AgendaHeader() {
  const intl = useIntl();
  const agenda = useAgenda();

  const updatedTs = new Date(agenda.updatedAt).getTime();

  return (
    <LinkBox
      as={Stack}
      display="inline-flex"
      verticalAlign="top"
      spacing="8"
      direction={{ base: 'column', md: 'row' }}
      align="center"
    >
      {agenda.image ? (
        <Image
          rounded="full"
          width="56"
          height="56"
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
          h="56px"
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
          fontSize="2xl"
          mt={agenda.network ? '0 !important' : undefined}
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

        <NextChakraLinkOverlay href={`/${encodeURIComponent(agenda.slug)}`}>
          {intl.formatMessage(messages.showAllEvents)}
        </NextChakraLinkOverlay>
      </VStack>
    </LinkBox>
  );
}
