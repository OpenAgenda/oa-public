import { useIntl } from 'react-intl';
import { HStack, NoBreak, Text, Flex, Tag, LinkBox } from '@openagenda/uikit';
import Image from 'components/Image';
import { keyCDNLoader } from 'utils/imageLoader';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import NextChakraLinkOverlay from 'components/NextChakraLinkOverlay';
import NextChakraLink from 'components/NextChakraLink';
import graylogo140 from '../../../../public/images/graylogo140.png';
import messages from '../messages';

export default function AgendaItem({ agenda }) {
  const intl = useIntl();

  const isDev = process.env.NODE_ENV === 'development';

  const imageSrc = agenda.image && `${process.env.NEXT_PUBLIC_IMAGE_PREFIX}${agenda.image}`;

  const currentAndUpcomingEvents = (agenda.summary?.publishedEvents?.current ?? 0)
    + (agenda.summary?.publishedEvents?.upcoming ?? 0);
  const passedEvents = agenda.summary?.publishedEvents?.passed ?? 0;

  return (
    <LinkBox as={HStack} spacing="2">
      <Image
        rounded="full"
        width="96"
        height="96"
        src={imageSrc || graylogo140}
        fallbackSrc={isDev && typeof imageSrc === 'string'
          ? imageSrc.replace('cibuldev', 'cibul').replace('images-', 'imagesdev-')
          : undefined}
        alt=""
        draggable={false}
        loader={imageSrc ? keyCDNLoader : null}
        border="3px solid white"
        h="96px"
        objectFit="cover"
      />

      <Flex direction="column">
        {agenda.network ? (
          <NextChakraLink href={`?network=${agenda.network.uid}`}>
            {agenda.network.title}
            &nbsp;›
          </NextChakraLink>
        ) : null}

        <Text fontWeight="bold" mb="2">
          <NextChakraLinkOverlay href={`/${agenda.slug}`}>
            {agenda.title}
          </NextChakraLinkOverlay>
          {agenda.official ? (
            <NoBreak>
              <OfficialAgenda
                ml="2"
                tooltipProps={{
                  bg: 'black',
                  color: 'white',
                }}
              />
            </NoBreak>
          ) : null}
          {agenda.private ? (
            <NoBreak>
              <LockIcon
                type="agenda"
                ml="2"
                tooltipProps={{
                  bg: 'black',
                  color: 'white',
                }}
              />
            </NoBreak>
          ) : null}
        </Text>

        <Text mb="2">
          {agenda.description}
        </Text>

        <div>
          {currentAndUpcomingEvents ? (
            <Tag
              borderRadius="full"
              variant="outline"
              colorScheme="primary"
            >
              <b>{intl.formatMessage(messages.upcomingEvents, { count: currentAndUpcomingEvents })}</b>
            </Tag>
          ) : null}

          {passedEvents && !currentAndUpcomingEvents ? (
            <Tag
              borderRadius="full"
              variant="outline"
              colorScheme="oaGray"
            >
              <b>{intl.formatMessage(messages.passedEvents, { count: passedEvents })}</b>
            </Tag>
          ) : null}
        </div>
      </Flex>
    </LinkBox>
  );
}
