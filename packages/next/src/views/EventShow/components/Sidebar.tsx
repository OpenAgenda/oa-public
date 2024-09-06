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
import { getCurrentValue as getCurrentPassValue } from '@openagenda/registrations/passCulture/iso/utils';
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

function getPassImgSource(passData) {
  const currValue = getCurrentPassValue(passData);
  if (currValue?.isRejected) return 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-rejected-22.png';
  if (currValue?.isPending) return 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-pending-22.png';
  if (currValue?.error) return 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-error-22.png';
  return 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-22.png';
}

function defaultGetRegistrationIcon(type: string) {
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

function getRegistrationLink({ value, type }: { value: string; type: string }) {
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

function defaultGetAccessibilityIcon(type: string) {
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

function extractPassFromRegistration(intl, registration) {
  const passItem = registration.find(
    ({ service }) => service === 'passCulture',
  );
  const currentPassData = passItem ? getCurrentPassValue(passItem.data) : null;

  return {
    registration: registration.filter(
      ({ service }) => service !== 'passCulture',
    ),
    passCulture:
      currentPassData && !currentPassData.isPending
        ? {
          img: 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-22.png',
          label: intl.formatMessage(messages.accessPassOffer),
          ...passItem,
        }
        : null,
  };
}

export function ShareSection({
  isDisabled,
  shareOnOpen,
  icon = faShareNodes,
  ...props
}) {
  const intl = useIntl();

  return (
    <Grid
      templateColumns="2em 1fr"
      columnGap="4"
      rowGap="1"
      alignItems="center"
      {...props}
    >
      <Icon as={FaIcon} icon={icon} size="2xl" color="oaGray.300" />
      <Button
        onClick={shareOnOpen}
        // leftIcon={<OAIcon />}
        variant="solid"
        colorScheme="primary"
        isDisabled={isDisabled}
      >
        {intl.formatMessage(messages.share)}
      </Button>
    </Grid>
  );
}

export function OnlineAccessSection({ event, icon = faLink, ...props }) {
  const intl = useIntl();

  if (!event.onlineAccessLink) {
    return null;
  }

  return (
    <Grid
      templateColumns="2em 1fr"
      columnGap="4"
      rowGap="1"
      alignItems="center"
      justifyItems="flex-start"
      {...props}
    >
      <Icon as={FaIcon} icon={icon} size="2xl" color="oaGray.300" />
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

export function DateRangeSection({
  event,
  upcomingIcon = faClock,
  pastIcon = faClockRotateLeft,
  ...props
}) {
  const intl = useIntl();

  const isUpcoming = useMemo(() => {
    const now = new Date();
    return event.timings.some((timing) => new Date(timing.end) > now);
  }, [event.timings]);

  return (
    <Grid
      templateColumns="2em 1fr"
      columnGap="4"
      rowGap="1"
      alignItems="center"
      {...props}
    >
      <Icon
        as={FaIcon}
        icon={isUpcoming ? upcomingIcon : pastIcon}
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

export function ConditionsSection({ event, icon = faTicket, ...props }) {
  const intl = useIntl();

  if (!event.conditions?.[intl.locale]) {
    return null;
  }

  return (
    <Grid
      templateColumns="2em 1fr"
      columnGap="4"
      rowGap="1"
      alignItems="center"
      {...props}
    >
      <Icon as={FaIcon} icon={icon} size="2xl" color="oaGray.300" />
      <Box fontSize="lg" color="oaGray.500">
        <b>{intl.formatMessage(messages.conditions)}</b>
      </Box>
      <Box gridColumn="2">{event.conditions[intl.locale]}</Box>
    </Grid>
  );
}

export function RegistrationSection({
  event,
  icon = faSquareCheck,
  getRegistrationIcon = defaultGetRegistrationIcon,
  ...props
}) {
  const intl = useIntl();

  const { registration, passCulture } = extractPassFromRegistration(
    intl,
    event.registration,
  );

  if (!passCulture && !registration?.length) {
    return null;
  }

  return (
    <Grid
      templateColumns="2em 1fr"
      columnGap="4"
      rowGap="1"
      alignItems="center"
      justifyItems="flex-start"
      {...props}
    >
      <Icon as={FaIcon} icon={icon} size="2xl" color="oaGray.300" />
      <Box fontSize="lg" color="oaGray.500">
        <b>{intl.formatMessage(messages.registration)}</b>
      </Box>
      {registration.map((registrationItem) => (
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
              {registrationItem.type === 'link'
                ? intl.formatMessage(messages.registerBook)
                : ''}
              &nbsp;
              {registrationItem.value}
            </Link>
          </Tooltip>
        </Fragment>
      ))}
      {passCulture ? (
        <Button
          as={Link}
          href={passCulture.value}
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
          leftIcon={<img src={getPassImgSource(passCulture)} alt="" />}
          justifySelf="start"
        >
          {intl.formatMessage(messages.accessPassOffer)}
        </Button>
      ) : null}
    </Grid>
  );
}

export function TimingsSection({ event }) {
  return (
    <Box ml="12">
      <Timings timings={event.timings} timezone={event.timezone} />
    </Box>
  );
}

export function AccessibilitySection({
  event,
  ageIcon = faChild,
  getAccessibilityIcon = defaultGetAccessibilityIcon,
  ...props
}) {
  const intl = useIntl();

  const accessibilities = Object.entries(event.accessibility);

  const hasAccessibility = accessibilities.some((v) => v[1] === true);

  if (!hasAccessibility && !event.age?.min && !event.age?.max) {
    return null;
  }

  return (
    <Grid
      templateColumns="2em 1fr"
      columnGap="4"
      rowGap="8"
      alignItems="center"
      {...props}
    >
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
            icon={ageIcon}
            size="2xl"
            color="oaGray.300"
            justifySelf="end"
          />

          <div>
            {!event.age.max
              ? intl.formatMessage(messages.startingAt, { min: event.age.min })
              : intl.formatMessage(messages.minToMaxYearsOld, {
                min: event.age.min,
                max: event.age.max,
              })}
          </div>
        </>
      ) : null}
    </Grid>
  );
}

export function LocationSection({ event, icon = faLocationDot }) {
  if (!event.location?.latitude || !event.location?.longitude) {
    return null;
  }
  return (
    <Grid
      templateColumns="2em 1fr"
      columnGap="4"
      rowGap="1"
      alignItems="center"
    >
      <Icon as={FaIcon} icon={icon} size="2xl" color="oaGray.300" />
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
          {['department', 'region', 'country'].map((part) => (
            <WrapItem key={part}>{event.location[part]}</WrapItem>
          ))}
        </Wrap>
      </Box>
      <Map
        key={event.uid}
        width={300}
        height={200}
        center={[event.location.latitude, event.location.longitude]}
        zoom={14}
        aspectRatioProps={{ gridColumn: 2 }}
      />
    </Grid>
  );
}

export function ReferencesSection({ agenda, event }) {
  return (
    <Box ml="12">
      <References agenda={agenda} event={event} />
    </Box>
  );
}

export default function Sidebar({ shareOnOpen = null }) {
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
      <ShareSection isDisabled={!!event.private} shareOnOpen={shareOnOpen} />
      <OnlineAccessSection event={event} />
      <DateRangeSection event={event} />
      <ConditionsSection event={event} />
      <RegistrationSection event={event} />
      <TimingsSection event={event} />
      <AccessibilitySection event={event} />
      <LocationSection event={event} />
      <ReferencesSection agenda={agenda} event={event} />
    </Flex>
  );
}
