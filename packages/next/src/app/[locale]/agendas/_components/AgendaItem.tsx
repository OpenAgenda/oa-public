import NextLink from 'next/link';
import { useIntl } from 'react-intl';
import {
  Box,
  HStack,
  NoBreak,
  Text,
  Flex,
  Link,
  LinkBox,
  LinkOverlay,
} from '@openagenda/uikit';
import { Tag } from '@openagenda/uikit/snippets';
import Image from '@/src/components/Image';
import { thumborLoader } from '@/src/utils/imageLoader';
import OfficialAgenda from '@/src/components/OfficialAgenda';
import LockIcon from '@/src/components/LockIcon';
import graylogo140 from '../../../../../public/images/graylogo140.png';
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
          <Link asChild colorPalette="gray">
            <NextLink href={`?network=${agenda.network.uid}`}>
              {agenda.network.title}
              &nbsp;›
            </NextLink>
          </Link>
        ) : null}

        <Text fontWeight="bold">
          <LinkOverlay asChild>
            <NextLink href={`/${agenda.slug}`}>{agenda.title}</NextLink>
          </LinkOverlay>
          {agenda.official ? (
            <NoBreak>
              <OfficialAgenda
                ml="2"
                // zIndex + position because of LinkBox
                zIndex="0"
                pos="relative"
                invertedColors
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
