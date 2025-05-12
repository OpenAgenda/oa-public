import { useIntl } from 'react-intl';
import { Button, Grid, Icon, Link } from '@openagenda/uikit';
import { FaIcon } from 'icons';
import {
  AccessibilitySection,
  ConditionsSection,
  DateRangeSection,
  LocationPreview,
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
  faLocationDot,
} from 'icons/thin';
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
      <Icon color="oaGray.300">
        <FaIcon icon={icon} size="2xl" />
      </Icon>
      <Button
        asChild
        // leftIcon={<OAIcon />}
        variant="outline"
        disabled={!!event.private}
      >
        <Link
          href={`/${agenda.slug}/events/${event.slug}?sharemodal=1`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {intl.formatMessage(messages.share)}
        </Link>
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
      <AccessibilitySection event={event} ageIcon={faChild} />
      <LocationPreview event={event} icon={faLocationDot} />
    </>
  );
}
