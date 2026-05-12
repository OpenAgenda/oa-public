import { useMemo } from 'react';
import { Bleed } from '@openagenda/uikit';
import { AccordionRoot, DialogBody } from '@openagenda/uikit/snippets';
import type { Agenda, Event, User } from '../../types';
import UnloggedBody from './UnloggedBody';
import ShareOnOA from './ShareOnOA';
import ShareOnSocialNetworks from './ShareOnSocialNetworks';
import ShareByEmail from './ShareByEmail';
import ShareCalendar from './ShareCalendar';
import ShareLink from './ShareLink';
import DownloadPDF from './DownloadPDF';

function toDefaultValueArray(value: string | string[] | null): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export default function Body({
  dialogRef,
  agenda,
  event,
  user,
  contentLocale,
  onClose,
  onEmailSent,
  defaultValue,
  rootUrl,
  renderHost,
  children = null,
}: {
  dialogRef: React.RefObject<HTMLDivElement>;
  agenda: Agenda;
  event: Event;
  user: User | null;
  contentLocale: string;
  onClose: () => void;
  onEmailSent: (count: number) => void;
  defaultValue: string | string[] | null;
  rootUrl: string;
  renderHost: 'local' | 'parent';
  children?: React.ReactNode;
}): React.JSX.Element {
  const eventUrl = useMemo(() => {
    const url = new URL(`/${agenda.slug}/events/${event.slug}`, rootUrl);
    if (contentLocale) {
      url.searchParams.set('cl', contentLocale);
    }
    return url;
  }, [agenda.slug, event.slug, rootUrl, contentLocale]);

  return (
    <DialogBody>
      {children}

      <Bleed inline="6">
        <AccordionRoot
          collapsible
          defaultValue={toDefaultValueArray(defaultValue)}
        >
          {renderHost === 'local' ? (
            <>
              {user ? (
                <ShareOnOA agenda={agenda} event={event} />
              ) : (
                <UnloggedBody />
              )}
            </>
          ) : null}
          <ShareOnSocialNetworks
            eventUrl={eventUrl}
            event={event}
            contentLocale={contentLocale}
          />
          {user && (
            <ShareByEmail
              agenda={agenda}
              event={event}
              onClose={onClose}
              onEmailSent={onEmailSent}
            />
          )}
          <ShareCalendar
            dialogRef={dialogRef}
            agenda={agenda}
            event={event}
            eventUrl={eventUrl}
            contentLocale={contentLocale}
          />
          <DownloadPDF rootUrl={rootUrl} agenda={agenda} event={event} />
          <ShareLink absUrl={eventUrl} />
        </AccordionRoot>
      </Bleed>
    </DialogBody>
  );
}
