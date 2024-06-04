import { Fragment, useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
  Flex,
  Icon,
  Button,
  Wrap,
  WrapItem,
  Grid,
  Box,
  Tag,
  HStack,
  Link,
  Tooltip,
} from '@openagenda/uikit';
import { getLocaleValue } from '@openagenda/intl';
import { FaIcon } from 'icons';
import {
  faShareNodes,
  faEnvelope,
  faClock,
  faSquareCheck,
  faLocationDot,
  faEarDeaf,
  faEyeLowVision,
} from 'icons/regular';
import {
  faLink,
  faClockRotateLeft,
  faTicket,
  faPhone,
  faWheelchair,
  faChild,
} from 'icons/solid';
import { faPI, faII } from 'icons/custom';
import { useAgenda } from '../contexts/agenda';
import useEvent from '../hooks/useEvent';
import { sidebar as messages } from '../messages';
import Timings from './Timings';
import References from './References';
import Map from './Map';

function getRegistrationIcon(type: string) {
  switch (type) {
    case 'phone':
      return faPhone;
    case 'link':
      return faLink;
    case 'email':
      return faEnvelope;
    default:
      return null;
  }
}

function getRegistrationLink({ value, type }: { value: string, type: string }) {
  switch (type) {
    case 'phone':
      return `tel:${value}`;
    case 'link':
      return value;
    case 'email':
      return `mailto:${value}`;
    default:
      return '#';
  }
}

function getAccessibilityIcon(type: string) {
  switch (type) {
    case 'ii': // accessibleToIntellectually
      return faII;
    case 'hi': // accessibleToHearing
      return faEarDeaf;
    case 'vi': // accessibleToVisually
      return faEyeLowVision;
    case 'pi': // accessibleToPsychic
      return faPI;
    case 'mi': // accessibleToMotor
      return faWheelchair;
    default:
      return null;
  }
}

function getAccessibilityMessage(type: string) {
  switch (type) {
    case 'ii':
      return messages.accessibleToIntellectually;
    case 'hi':
      return messages.accessibleToHearing;
    case 'vi':
      return messages.accessibleToVisually;
    case 'pi':
      return messages.accessibleToPsychic;
    case 'mi':
      return messages.accessibleToMotor;
    default:
      return null;
  }
}

export function ShareSection({ contentLocale, shareOnOpen, ...props }) {
  const intl = useIntl();

  const { event } = useEvent();

  return (
    <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center" {...props}>
      <Icon
        as={FaIcon}
        icon={faShareNodes}
        size="2xl"
        color="oaGray.300"
        mt="1"
      />
      <Button
        onClick={shareOnOpen}
        // leftIcon={<OAIcon />}
        variant="solid"
        colorScheme="primary"
        isDisabled={!!event.private}
      >
        {intl.formatMessage(messages.share)}
      </Button>
    </Grid>
  );
}

export function OnlineAccessSection(props) {
  const intl = useIntl();

  const { event } = useEvent();

  if (!event.onlineAccessLink) {
    return null;
  }

  return (
    <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center" {...props}>
      <Icon
        as={FaIcon}
        icon={faLink}
        size="2xl"
        color="oaGray.300"
      />
      <Button
        as={Link}
        isExternal
        href={event.onlineAccessLink}
        variant="outline"
        bg="white"
        borderColor="oaGray.300"
        color="blackAlpha.800"
        _hover={{
          bg: 'oaGray.100',
          color: 'blackAlpha.900',
          textDecoration: 'none',
        }}
      >
        {intl.formatMessage(messages.accessEventOnline)}
      </Button>
    </Grid>
  );
}

export function DateRangeSection(props) {
  const intl = useIntl();

  const { event } = useEvent();

  const isUpcoming = useMemo(() => {
    const now = new Date();
    return event.timings.some(timing => new Date(timing.end) > now);
  }, [event.timings]);

  return (
    <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center" {...props}>
      <Icon
        as={FaIcon}
        icon={isUpcoming ? faClock : faClockRotateLeft}
        size="2xl"
        color="oaGray.300"
      />
      <HStack>
        <span>{getLocaleValue(event.dateRange, intl.locale)}</span>
        {!event.nextTiming ? (
          <Tag
            borderRadius="full"
            variant="outline"
            colorScheme="oaGray"
            flexShrink="0"
          >
            <b>{intl.formatMessage(messages.passed)}</b>
          </Tag>
        ) : null}
      </HStack>
    </Grid>
  );
}

export function ConditionsSection(props) {
  const intl = useIntl();

  const { event } = useEvent();

  if (!event.conditions?.[intl.locale]) {
    return null;
  }

  return (
    <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center" {...props}>
      <Icon
        as={FaIcon}
        icon={faTicket}
        size="2xl"
        color="oaGray.300"
      />
      <Box fontSize="lg" color="oaGray.500">
        <b>{intl.formatMessage(messages.conditions)}</b>
      </Box>
      <Box gridColumn="2">{event.conditions[intl.locale]}</Box>
    </Grid>
  );
}

export function RegistrationSection(props) {
  const intl = useIntl();

  const { event } = useEvent();

  if (!event.registration?.length && !event.passCulture) {
    return null;
  }

  return (
    <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center" {...props}>
      <Icon
        as={FaIcon}
        icon={faSquareCheck}
        size="2xl"
        color="oaGray.300"
      />
      <Box fontSize="lg" color="oaGray.500">
        <b>{intl.formatMessage(messages.registration)}</b>
      </Box>
      {event.registration.map(registrationItem => (
        <Fragment key={registrationItem.value}>
          <Icon
            as={FaIcon}
            icon={getRegistrationIcon(registrationItem.type)}
            color="oaGray.300"
            justifySelf="end"
          />
          <Tooltip
            label={registrationItem.value}
            aria-label={intl.formatMessage(messages.completeLink)}
            hasArrow
            arrowSize={8}
            arrowPadding={6}
          >
            <Link
              isExternal
              href={getRegistrationLink(registrationItem)}
              colorScheme="primary"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {registrationItem.type === 'link' ? intl.formatMessage(messages.registerBook) : ''}
              &nbsp;
              {registrationItem.value}
            </Link>
          </Tooltip>
        </Fragment>
      ))}
      {event.passCulture ? (
        <Button
          as={Link}
          href={event.passCulture.value}
          isExternal
          gridColumn="2"
          variant="outline"
          bg="white"
          borderColor="oaGray.300"
          color="blackAlpha.800"
          _hover={{
            bg: 'oaGray.100',
            color: 'blackAlpha.900',
            textDecoration: 'none',
          }}
          leftIcon={<img src="https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-22.png" alt="" />}
          justifySelf="start"
        >
          {intl.formatMessage(messages.accessPassOffer)}
        </Button>
      ) : null}
    </Grid>
  );
}

export function AccessibilitySection(props) {
  const intl = useIntl();

  const { event } = useEvent();

  const accessibilities = Object.entries(event.accessibility);

  const hasAccessibility = accessibilities.some(v => v[1] === true);

  if (!hasAccessibility && !event.age?.min && !event.age?.max) {
    return null;
  }

  return (
    <Grid templateColumns="2em 1fr" columnGap="4" rowGap="8" alignItems="center" {...props}>
      {accessibilities.map(([accessibilityKey, accessibilityValue]) => {
        if (!accessibilityValue) {
          return null;
        }

        return (
          <Fragment key={accessibilityKey}>
            <Icon
              as={FaIcon}
              icon={getAccessibilityIcon(accessibilityKey)}
              size="2xl"
              color="oaGray.300"
              justifySelf="end"
            />

            <div>
              {intl.formatMessage(getAccessibilityMessage(accessibilityKey))}
            </div>
          </Fragment>
        );
      })}

      {event.age?.min || event.age?.max ? (
        <>
          <Icon
            as={FaIcon}
            icon={faChild}
            size="2xl"
            color="oaGray.300"
            justifySelf="end"
          />

          <div>
            {!event.age.max
              ? intl.formatMessage(messages.startingAt, { min: event.age.min })
              : intl.formatMessage(messages.minToMaxYearsOld, { min: event.age.min, max: event.age.max })}
          </div>
        </>
      ) : null}
    </Grid>
  );
}

export default function Sidebar({ contentLocale, shareOnOpen = null }) {
  const agenda = useAgenda();
  const { event } = useEvent();

  return (
    <Flex
      gap="8"
      direction="column"
      grow="1"
      // w={{ base: 'full', xl: '75%' }}
      // px={{ base: '4', xl: '0' }}
    >
      <ShareSection contentLocale={contentLocale} shareOnOpen={shareOnOpen} />
      <OnlineAccessSection />
      <DateRangeSection />
      <ConditionsSection />
      <RegistrationSection />

      <Box ml="12">
        <Timings timings={event.timings} timezone={event.timezone} key={event.uid} />
      </Box>

      <AccessibilitySection />

      {event.location?.latitude && event.location?.longitude ? (
        <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center">
          <Icon
            as={FaIcon}
            icon={faLocationDot}
            size="2xl"
            color="oaGray.300"
          />
          <Box>
            <p>{event.location.name}</p>
            <Link
              isExternal
              href={`https://www.openstreetmap.org/directions?to=${event.location.latitude}%2C${event.location.longitude}`}
              colorScheme="primary"
            >
              {event.location.address}
            </Link>
            <Wrap color="oaGray.500">
              {['department', 'region', 'country'].map(part => (
                <WrapItem key={part}>
                  {event.location[part]}
                </WrapItem>
              ))}
            </Wrap>
          </Box>
          <Map
            width={300}
            height={200}
            center={[event.location.latitude, event.location.longitude]}
            zoom={14}
            aspectRatioProps={{ gridColumn: 2 }}
          />
        </Grid>
      ) : null}

      <Box ml="12">
        <References agenda={agenda} event={event} />
      </Box>
    </Flex>
  );
}
