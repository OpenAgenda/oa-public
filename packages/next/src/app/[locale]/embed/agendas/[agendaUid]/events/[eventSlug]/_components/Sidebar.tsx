'use client';

import { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Grid, Icon } from '@openagenda/uikit';
import { FaIcon } from '@/src/icons';
import {
  AccessibilitySection,
  AgeSection,
  ConditionsSection,
  DateRangeSection,
  LocationPreview,
  OnlineAccessSection,
  RegistrationSection,
  TimingsSection,
} from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/Sidebar';
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
} from '@/src/icons/thin';
import { sidebar as messages } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/messages';
import { useAgenda } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_context/agenda';
import { useEmbedLayoutData } from '@/src/app/[locale]/embed/_components/EmbedLayoutShell';
import useEvent from '../_hooks/useEvent';

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

  const [isShareLoading, setIsShareLoading] = useState(false);

  const handleShareClick = useCallback(async () => {
    setIsShareLoading(true);
    try {
      await window.oaIFrame.callParent('openEventShareModal', {
        agenda,
        event,
        contentLocale,
        locale: intl.locale,
        themeConfig,
      });
    } catch (error) {
      console.error('Share modal error:', error);
    } finally {
      setIsShareLoading(false);
    }
  }, [agenda, event, contentLocale, intl.locale, themeConfig]);

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
        disabled={!!event.private || isShareLoading}
        loading={isShareLoading}
        onClick={handleShareClick}
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
      <AgeSection event={event} />
      <LocationPreview event={event} icon={faLocationDot} />
    </>
  );
}
