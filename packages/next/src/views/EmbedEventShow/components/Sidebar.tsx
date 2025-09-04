import { useIntl } from 'react-intl';
import { Button, Grid, Icon } from '@openagenda/uikit';
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
import { useEmbedLayoutData } from 'components/EmbedLayout';
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

export function ShareSection({
  event,
  contentLocale,
  icon = faShareNodes,
  ...props
}) {
  const intl = useIntl();
  const agenda = useAgenda();

  const { themeConfig } = useEmbedLayoutData();

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
        variant="outline"
        disabled={!!event.private}
        onClick={() =>
          window.parentIFrame.sendMessage({
            type: 'openEventShareModal',
            agenda,
            event,
            contentLocale,
            locale: intl.locale,
            themeConfig,
          })
        }
      >
        {intl.formatMessage(messages.share)}
      </Button>
    </Grid>
  );
}

export default function Sidebar({ referrer, contentLocale }) {
  const { event } = useEvent({ referrer });

  return (
    <>
      <ShareSection
        event={event}
        contentLocale={contentLocale}
        icon={faShareNodes}
      />
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
