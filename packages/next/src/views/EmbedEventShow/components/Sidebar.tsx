import { useIntl } from 'react-intl';
import { Button, Grid, Icon, Link } from '@openagenda/uikit';
import { FaIcon } from 'icons';
import {
  AccessibilitySection,
  ConditionsSection,
  DateRangeSection,
  LocationSection,
  OnlineAccessSection,
  RegistrationSection,
  TimingsSection,
} from 'views/EventShow/components/Sidebar';
import {
  faShareNodes,
  faLink,
  faClock,
  faClockRotateLeft,
  faTicket,
  faSquareCheck,
  faPhone,
  faEnvelope,
  faChild,
  faEarDeaf,
  faEyeLowVision,
  faWheelchair,
  faLocationDot,
} from 'icons/thin';
import { faII, faPI } from 'icons/custom';
import { sidebar as messages } from 'views/EventShow/messages';
import { useAgenda } from 'views/EventShow/contexts/agenda';
import useEvent from '../hooks/useEvent';

export function getRegistrationIcon(type: string) {
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

export function getAccessibilityIcon(type: string) {
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

export function ShareSection({ event, icon = faShareNodes, ...props }) {
  const intl = useIntl();
  const agenda = useAgenda();

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
        as={Link}
        href={`/${agenda.slug}/events/${event.slug}?sharemodal=1`}
        isExternal
        // leftIcon={<OAIcon />}
        variant="outline"
        colorScheme="primary"
        isDisabled={!!event.private}
      >
        {intl.formatMessage(messages.share)}
      </Button>
    </Grid>
  );
}

export default function Sidebar({ referrer }) {
  const { event } = useEvent({ referrer });

  return (
    <>
      <ShareSection event={event} icon={faShareNodes} />
      <OnlineAccessSection event={event} icon={faLink} />
      <DateRangeSection
        event={event}
        upcomingIcon={faClock}
        pastIcon={faClockRotateLeft}
      />
      <ConditionsSection event={event} icon={faTicket} />
      <RegistrationSection
        event={event}
        icon={faSquareCheck}
        getRegistrationIcon={getRegistrationIcon}
      />
      <TimingsSection event={event} />
      <AccessibilitySection
        event={event}
        ageIcon={faChild}
        getAccessibilityIcon={getAccessibilityIcon}
      />
      <LocationSection event={event} icon={faLocationDot} />
    </>
  );
}
