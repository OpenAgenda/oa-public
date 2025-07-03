import NextLink from 'next/link';
import { useIntl } from 'react-intl';
import {
  Box,
  Heading,
  NoBreak,
  Stack,
  VStack,
  Link,
  LinkBox,
  LinkOverlay,
} from '@openagenda/uikit';
import Image from 'components/Image';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import { thumborLoader } from 'utils/imageLoader';
import { useAgenda } from '../contexts/agenda';
import { agendaHeader as messages } from '../messages';

const isDev = process.env.NODE_ENV === 'development';

export default function AgendaHeader() {
  const intl = useIntl();
  const agenda = useAgenda();

  const imageSrc = agenda.image
    ? new URL(agenda.image).pathname.replace(/^\//, '')
    : null;

  return (
    <LinkBox asChild>
      <Stack
        display="inline-flex"
        verticalAlign="top"
        gap="8"
        direction={{ base: 'column', md: 'row' }}
        align="center"
      >
        {agenda.image ? (
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
        ) : null}

        <VStack gap="3" align={{ base: 'center', md: 'start' }}>
          {agenda.network ? (
            <Link asChild>
              <Link
                href={`/agendas?network=${agenda.network.uid}`}
                colorPalette="oaBlue"
              >
                {agenda.network.title}
                &nbsp;›
              </Link>
            </Link>
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
                <OfficialAgenda
                  ml="4"
                  // zIndex + position because of LinkBox
                  zIndex="1"
                  pos="relative"
                />
              </NoBreak>
            ) : null}
            {agenda.private ? (
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

          <LinkOverlay asChild>
            <NextLink href={`/${encodeURIComponent(agenda.slug)}`}>
              {intl.formatMessage(messages.showAllEvents)}
            </NextLink>
          </LinkOverlay>
        </VStack>
      </Stack>
    </LinkBox>
  );
}
