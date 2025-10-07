import { useMemo } from 'react';
import { Bleed } from '@openagenda/uikit';
import { AccordionRoot, DialogBody } from '@openagenda/uikit/snippets';
import UnloggedBody from './UnloggedBody';
import ShareOnOA from './ShareOnOA';
import ShareOnSocialNetworks from './ShareOnSocialNetworks';
import ShareByEmail from './ShareByEmail';
import ShareCalendar from './ShareCalendar';
import ShareLink from './ShareLink';
import DownloadPDF from './DownloadPDF';

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
}) {
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
        <AccordionRoot collapsible defaultValue={[defaultValue]}>
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
          <DownloadPDF agenda={agenda} event={event} />
          <ShareLink absUrl={eventUrl} />
        </AccordionRoot>
      </Bleed>
    </DialogBody>
  );
}
