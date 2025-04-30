import { Fragment, useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
  chakra,
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
} from '@openagenda/uikit';
import { Tooltip } from '@openagenda/uikit/snippets';
import { getLocaleValue } from '@openagenda/intl';
import { getCurrentValue as getCurrentPassValue } from '@openagenda/registrations/passCulture/iso/utils';
import { FaIcon } from 'icons';
import {
  faShareNodes,
  faEnvelope,
  faClock,
  faSquareCheck,
  faLocationDot,
} from 'icons/regular';
import { faLink, faClockRotateLeft, faTicket, faPhone } from 'icons/solid';
import defaultSize from 'utils/defaultSize';
import { useAgenda } from '../contexts/agenda';
import useEvent from '../hooks/useEvent';
import { sidebar as messages } from '../messages';
import Timings from './Timings';
import References from './References';
import AccessibilitySection from './AccessibilitySection';
import AgeSection from './AgeSection';
import Map from './Map';

export { default as AccessibilitySection } from './AccessibilitySection';

function getPassImgSource(passData) {
  const currValue = getCurrentPassValue(passData);
  if (currValue?.isRejected)
    return 'https://cdn.openagenda.com/assets/svc/registration-apps/pass-culture-rejected-22.png';
  if (currValue?.isPending)
    return 'https://cdn.openagenda.com/assets/svc/registration-apps/pass-culture-pending-22.png';
  if (currValue?.error)
    return 'https://cdn.openagenda.com/assets/svc/registration-apps/pass-culture-error-22.png';
  if (!currValue?.value)
    return 'https://cdn.openagenda.com/assets/svc/registration-apps/pass-culture-unpublished-22.png';
  return 'https://cdn.openagenda.com/assets/svc/registration-apps/pass-culture-22.png';
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

function extractPassFromRegistration(intl, registration) {
  const passItem = registration?.find(
    ({ service }) => service === 'passCulture',
  );
  const currentPassData = passItem ? getCurrentPassValue(passItem.data) : null;

  return {
    registration: registration?.filter(
      ({ service }) => service !== 'passCulture',
    ),
    passCulture:
      currentPassData && !currentPassData.isPending
        ? {
            img: 'https://cdn.openagenda.com/assets/svc/registration-apps/pass-culture-22.png',
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
      <Icon color="oaGray.300" justifySelf="center" fontSize="3xl">
        <FaIcon icon={icon} />
      </Icon>
      <Button onClick={shareOnOpen} disabled={isDisabled}>
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
      <Icon color="oaGray.300" justifySelf="center" fontSize="3xl">
        <FaIcon icon={icon} />
      </Icon>
      <Button
        asChild
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
        <Link
          unstyled
          href={event.onlineAccessLink}
          target="_blank"
          rel="noopener nofollow"
        >
          {intl.formatMessage(messages.accessEventOnline)}
        </Link>
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
      <Icon color="oaGray.300" justifySelf="center" fontSize="3xl">
        <FaIcon icon={isUpcoming ? upcomingIcon : pastIcon} />
      </Icon>
      <HStack>
        <chakra.span fontSize={defaultSize}>
          {getLocaleValue(event.dateRange, intl.locale)}
        </chakra.span>
        {!event.nextTiming ? (
          <Tag.Root
            borderRadius="full"
            variant="outline"
            colorPalette="oaGray"
            flexShrink="0"
          >
            <Tag.Label>
              <b>{intl.formatMessage(messages.passed)}</b>
            </Tag.Label>
          </Tag.Root>
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
      <Icon color="oaGray.300" justifySelf="center" fontSize="3xl">
        <FaIcon icon={icon} />
      </Icon>
      <Box color="oaGray.500">
        <b>{intl.formatMessage(messages.conditions)}</b>
      </Box>
      <Box gridColumn="2" fontSize={defaultSize}>
        {event.conditions[intl.locale]}
      </Box>
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
      <Icon color="oaGray.300" justifySelf="center" fontSize="3xl">
        <FaIcon icon={icon} />
      </Icon>
      <Box color="oaGray.500">
        <b>{intl.formatMessage(messages.registration)}</b>
      </Box>
      {registration.map((registrationItem) => (
        <Fragment key={registrationItem.value}>
          <Icon color="oaGray.300" justifySelf="end">
            <FaIcon icon={getRegistrationIcon(registrationItem.type)} />
          </Icon>
          <Tooltip
            content={registrationItem.value}
            aria-label={intl.formatMessage(messages.completeLink)}
            showArrow
            openDelay={0}
            closeDelay={0}
          >
            <Link
              href={getRegistrationLink(registrationItem)}
              target="_blank"
              rel="noopener nofollow"
              // whiteSpace="normal"
              // overflow="hidden"
              // textOverflow="ellipsis"
              wordBreak="break-all"
              maxW="full"
              lineClamp={2}
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
          asChild
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
          justifySelf="start"
        >
          <Link
            unstyled
            href={passCulture.value}
            target="_blank"
            rel="noopener nofollow"
          >
            <img src={getPassImgSource(passCulture)} alt="" />
            {getCurrentPassValue(passCulture)?.value
              ? intl.formatMessage(messages.accessPassOffer)
              : intl.formatMessage(messages.passUnpublished)}
          </Link>
        </Button>
      ) : null}
    </Grid>
  );
}

export function TimingsSection({ event }) {
  return (
    <Box ml="12" fontSize={defaultSize}>
      <Timings timings={event.timings} timezone={event.timezone} />
    </Box>
  );
}

export function LocationPreview({ event, icon = faLocationDot }) {
  if (
    event.location?.latitude === undefined ||
    event.location?.longitude === undefined
  ) {
    return null;
  }
  return (
    <Grid
      templateColumns="2em 1fr"
      columnGap="4"
      rowGap="1"
      alignItems="center"
    >
      <Icon color="oaGray.300" justifySelf="center" fontSize="3xl">
        <FaIcon icon={icon} />
      </Icon>
      <Box fontSize={defaultSize}>
        <p>{event.location.name}</p>
        <Link
          href={`https://www.openstreetmap.org/directions?to=${event.location.latitude}%2C${event.location.longitude}`}
          target="_blank"
          rel="noopener nofollow"
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
      <AgeSection event={event} />
      <LocationPreview event={event} />
      <ReferencesSection agenda={agenda} event={event} />
    </Flex>
  );
}
