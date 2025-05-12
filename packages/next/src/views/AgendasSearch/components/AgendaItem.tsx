import { useIntl } from 'react-intl';
import { Box, HStack, NoBreak, Text, Flex, LinkBox } from '@openagenda/uikit';
import { Tag } from '@openagenda/uikit/snippets';
import Image from 'components/Image';
import { thumborLoader } from 'utils/imageLoader';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import NextChakraLinkOverlay from 'components/NextChakraLinkOverlay';
import NextChakraLink from 'components/NextChakraLink';
import graylogo140 from '../../../../public/images/graylogo140.png';
import messages from '../messages';

const isDev = process.env.NODE_ENV === 'development';

function getImageSrc(image) {
  if (!image) return null;

  return isDev
    ? `${process.env.NEXT_PUBLIC_DEV_S3_BUCKET}/${image}`
    : `${process.env.NEXT_PUBLIC_S3_BUCKET}/${image}`;
}

export default function AgendaItem({ agenda }) {
  const intl = useIntl();

  const imageSrc = getImageSrc(agenda.image);

  const currentAndUpcomingEvents =
    (agenda.summary?.publishedEvents?.current ?? 0) +
    (agenda.summary?.publishedEvents?.upcoming ?? 0);
  const passedEvents = agenda.summary?.publishedEvents?.passed ?? 0;

  return (
    <LinkBox as={HStack} gap="2">
      <Box
        asChild
        rounded="full"
        border="3px solid white"
        h="96px"
        objectFit="cover"
      >
        <Image
          width="96"
          height="96"
          src={imageSrc || graylogo140}
          fallbackSrc={
            isDev && typeof imageSrc === 'string'
              ? imageSrc.replace('dev', 'main').replace('images-', 'imagesdev-')
              : undefined
          }
          alt=""
          draggable={false}
          loader={imageSrc ? thumborLoader : null}
        />
      </Box>

      <Flex direction="column">
        {agenda.network ? (
          <NextChakraLink
            href={`?network=${agenda.network.uid}`}
            colorPalette="gray"
          >
            {agenda.network.title}
            &nbsp;›
          </NextChakraLink>
        ) : null}

        <Text fontWeight="bold">
          <NextChakraLinkOverlay href={`/${agenda.slug}`}>
            {agenda.title}
          </NextChakraLinkOverlay>
          {agenda.official ? (
            <NoBreak>
              <OfficialAgenda
                ml="2"
                // zIndex + position because of LinkBox
                zIndex="0"
                pos="relative"
                tooltipProps={{
                  contentProps: {
                    css: { '--tooltip-bg': 'black' },
                    color: 'white',
                  },
                }}
              />
            </NoBreak>
          ) : null}
          {agenda.private ? (
            <NoBreak>
              <LockIcon
                type="agenda"
                ml="2"
                // zIndex + position because of LinkBox
                zIndex="0"
                pos="relative"
                tooltipProps={{
                  contentProps: {
                    css: { '--tooltip-bg': 'black' },
                    color: 'white',
                  },
                }}
              />
            </NoBreak>
          ) : null}
        </Text>

        <Text mb="2">{agenda.description}</Text>

        <div>
          {currentAndUpcomingEvents ? (
            <Tag borderRadius="full" variant="outline" colorPalette="primary">
              <b>
                {intl.formatMessage(messages.upcomingEvents, {
                  count: currentAndUpcomingEvents,
                })}
              </b>
            </Tag>
          ) : null}

          {passedEvents && !currentAndUpcomingEvents ? (
            <Tag borderRadius="full" variant="outline" colorPalette="oaGray">
              <b>
                {intl.formatMessage(messages.passedEvents, {
                  count: passedEvents,
                })}
              </b>
            </Tag>
          ) : null}
        </div>
      </Flex>
    </LinkBox>
  );
}
