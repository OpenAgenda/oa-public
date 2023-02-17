import _ from 'lodash';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { defineMessages, useIntl } from 'react-intl';
import { formatDistance } from 'date-fns';
import useLocalStorageState from 'use-local-storage-state';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  List,
  ListItem,
  ListIcon,
  Text,
  LinkBox,
} from '@openagenda/uikit';
import { getLocaleValue } from '@openagenda/intl';
import { useForm } from '@openagenda/react-filters';
import attendanceModesMessages from '@openagenda/common-labels/event/attendanceModes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faStar, faLocationDot } from '@fortawesome/pro-regular-svg-icons';
import { faLink, faThumbtack, faShare, faStar as fasStar } from '@fortawesome/pro-solid-svg-icons';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useIsMounted from 'hooks/useIsMounted';
import upperFirst from 'utils/upperFirst';
import NextChakraLink from 'components/NextChakraLink';
import NextChakraLinkOverlay from 'components/NextChakraLinkOverlay';
import Image from 'components/Image';

const IMAGE_PREFIX = 'https://cibul.s3.amazonaws.com/';

const messages = defineMessages({
  featured: {
    id: 'next.views.AgendaShow.EventItem.featured',
    defaultMessage: 'Featured',
  },
  addToFavorites: {
    id: 'next.views.AgendaShow.EventItem.addToFavorites',
    defaultMessage: 'Add to favorites',
  },
  removeFromFavorites: {
    id: 'next.views.AgendaShow.EventItem.removeFromFavorites',
    defaultMessage: 'Remove from favorites',
  },
});

function FavoriteButton({ agenda, event }) {
  const intl = useIntl();
  const form = useForm();
  const [favorites, setFavorites] = useLocalStorageState('favorites');
  const agendaFavorites = favorites?.[agenda.uid];
  const isFavorite = agendaFavorites?.includes(event.uid);

  const toggleFavorite = useCallback(() => {
    setFavorites(prev => {
      if (isFavorite) { // remove favorite
        const newValue = prev[agenda.uid].filter(v => v !== event.uid);
        return {
          ...prev,
          [agenda.uid]: newValue.length ? newValue : undefined,
        };
      }
      return { // add favorite
        ...prev,
        [agenda.uid]: [
          ...prev?.[agenda.uid] || [],
          event.uid,
        ],
      };
    });
  }, [agenda.uid, event.uid, isFavorite, setFavorites]);

  // Watch value change
  useEffect(() => {
    // const active = agendaFavorites?.includes(event.uid);

    // updateCustomFilter(widget, active);

    const formValues = form.getState().values;
    const value = agendaFavorites?.map(String);

    // if favorties filter checked
    if (formValues.favorites && !_.isEqual(formValues.uid, value)) {
      form.change('uid', agendaFavorites?.length ? value : ['-1']);
    }
  }, [form, event.uid, agendaFavorites]);

  return (
    <IconButton
      aria-label={intl.formatMessage(messages[isFavorite ? 'removeFromFavorites' : 'addToFavorites'])}
      variant="link"
      colorScheme={isFavorite ? 'primary' : 'oaGray'}
      onClick={toggleFavorite}
      size="lg"
      fontSize="xl"
      icon={<FontAwesomeIcon icon={isFavorite ? fasStar : faStar} />}
      minW="0"
      ml="6"
      // px="0"
    />
  );
}

export default function EventItem({ event, agenda }) {
  const router = useRouter();
  const intl = useIntl();
  const dateFnsLocale = useDateFnsLocale();
  const isMounted = useIsMounted();

  const closestTiming = event.nextTiming ? event.nextTiming : event.lastTiming;

  const redirectUrl = Buffer.from(router.asPath).toString('base64');

  return (
    <Flex
      as="article"
      direction={{ base: 'column', xl: 'row' }}
      gap={{ base: '2', xl: '8' }}
      mx={{ base: 'auto', xl: '0' }}
      px={{ base: '4', xl: '0' }}
      maxW={{ base: 'xl', xl: 'none' }}
      w="full"
    >
      <Box as="aside" w={{ base: 'full', xl: '25%' }} mt={{ xl: '4' }}>
        <Flex justify={{ base: 'flex-start', xl: 'flex-end' }}>
          <div>
            {event.featured ? (
              <Text mb="2">
                <FontAwesomeIcon icon={faThumbtack} />
                &nbsp;
                {intl.formatMessage(messages.featured)}
              </Text>
            ) : null}
            <Text color="oaGray.500">
              {isMounted ? upperFirst(formatDistance(
                new Date(closestTiming.begin),
                new Date(),
                { locale: dateFnsLocale, addSuffix: true },
              )) : null}
            </Text>
          </div>
        </Flex>
      </Box>

      <LinkBox
        as="section"
        display="flex"
        flexDirection="column"
        gap="4"
        position="relative"
        // py="4"
        pt="4"
        w={{ base: 'full', xl: '75%' }}
        bg="white"
        // border="1px solid"
        // borderColor="oaGray.100"
        borderRadius="sm"
        // _hover={{
        //   borderColor: 'primary.500',
        // }}
      >
        <Flex direction="row" align="center" px="6" justify="space-between">
          <Heading as="h2" fontSize="xl">
            <NextChakraLinkOverlay
              href={`/${agenda.slug}/events/${event.slug}`}
              locale={false}
              _hover={{
                _before: {
                  border: '1px solid',
                  borderColor: 'primary.500',
                },
              }}
            >
              {getLocaleValue(event.title, intl.locale)}
            </NextChakraLinkOverlay>
          </Heading>

          <FavoriteButton agenda={agenda} event={event} />
        </Flex>

        {/* eslint-disable-next-line no-nested-ternary */}
        {event.image
          ? event.image?.size?.width && event.image?.size?.height ? (
            <Image
              src={`${IMAGE_PREFIX}${event.image.filename}`}
              width={event.image.size.width}
              height={event.image.size.height}
              unoptimized
              alt=""
              m="auto"
              w="full"
            />
          ) : (
            <Image
              src={`${IMAGE_PREFIX}${event.image.filename}`}
              fill
              // @ts-ignore https://github.com/chakra-ui/chakra-ui/issues/7211
              pos="unset !important"
              w="full !important"
              h="auto !important"
              unoptimized
              alt=""
              m="auto"
            />
          )
          : null}

        {/* TODO: add a title with a precise date */}
        <Text px="6">
          {getLocaleValue(event.description, intl.locale)}
        </Text>

        <Flex justify="space-between">
          <List spacing="2" px="6" color="oaGray.500" pb="4">
            <ListItem ml="6">
              <ListIcon as={FontAwesomeIcon} icon={faClock} verticalAlign="" ml="-6" />
              {getLocaleValue(event.dateRange, intl.locale)}
            </ListItem>
            {event.onlineAccessLink ? (
              <ListItem ml="6">
                <ListIcon as={FontAwesomeIcon} icon={faLink} verticalAlign="" ml="-6" />
                {intl.formatMessage(attendanceModesMessages.online)}
              </ListItem>
            ) : null}
            {event.location ? (
              <ListItem ml="6">
                <ListIcon as={FontAwesomeIcon} icon={faLocationDot} verticalAlign="" ml="-6" />
                {event.location.name}{event.location.city ? `, ${event.location.city}` : ''}
              </ListItem>
            ) : null}
          </List>

          <Box
            float="right"
            display="flex"
            alignItems="flex-end"
            alignSelf="flex-end"
          >
            <Button
              as={NextChakraLink}
              href={`/${agenda.slug}/events/${event.slug}/action?redirect=${redirectUrl}`}
              locale={false}
              colorScheme="primary"
              borderRadius="sm"
              display={{ base: 'none', sm: 'inline-flex' }}
            >
              Partager
            </Button>

            <Button
              as={NextChakraLink}
              href={`/${agenda.slug}/events/${event.slug}/action?redirect=${redirectUrl}`}
              locale={false}
              colorScheme="primary"
              borderRadius="sm"
              display={{ base: 'inline-flex', sm: 'none' }}
            >
              <FontAwesomeIcon icon={faShare} />
            </Button>
          </Box>
        </Flex>
      </LinkBox>
    </Flex>
  );
}
