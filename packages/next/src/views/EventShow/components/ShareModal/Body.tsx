import { useMemo } from 'react';
import { Bleed } from '@openagenda/uikit';
import { AccordionRoot, DialogBody } from '@openagenda/uikit/snippets';
import useUser from 'hooks/useUser';
import useSearchParams from 'hooks/useSearchParams';
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
  contentLocale,
  onClose,
  onEmailSent,
  defaultValue,
  children = null,
}) {
  const { user } = useUser();

  const searchParams = useSearchParams() as { cl?: string };

  const eventUrl = useMemo(() => {
    const url = new URL(
      `/${agenda.slug}/events/${event.slug}`,
      window.location.href,
    );
    if (searchParams.cl) {
      url.searchParams.set('cl', searchParams.cl);
    }
    return url;
  }, [agenda.slug, event.slug, searchParams.cl]);

  return (
    <DialogBody>
      {children}

      <Bleed inline="6">
        <AccordionRoot as="form" collapsible defaultValue={[defaultValue]}>
          {user ? (
            <ShareOnOA agenda={agenda} event={event} />
          ) : (
            <UnloggedBody />
          )}
          <ShareOnSocialNetworks
            eventUrl={eventUrl}
            event={event}
            contentLocale={contentLocale}
          />
          <ShareByEmail
            agenda={agenda}
            event={event}
            onClose={onClose}
            onEmailSent={onEmailSent}
          />
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
