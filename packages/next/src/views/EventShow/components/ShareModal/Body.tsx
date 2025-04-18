import { Bleed } from '@openagenda/uikit';
import { AccordionRoot, DialogBody } from '@openagenda/uikit/snippets';
import useUser from 'hooks/useUser';
import UnloggedBody from './UnloggedBody';
import ShareOnOA from './ShareOnOA';
import ShareOnSocialNetworks from './ShareOnSocialNetworks';
import ShareByEmail from './ShareByEmail';
import ShareCalendar from './ShareCalendar';
import ShareLink from './ShareLink';

export default function Body({
  dialogRef,
  agenda,
  event,
  contentLocale,
  onClose,
  onEmailSent,
  defaultValue,
}) {
  const { user } = useUser();

  return (
    <DialogBody>
      <Bleed inline="6">
        <AccordionRoot
          as="form"
          collapsible
          defaultValue={[defaultValue]}
          mt="4"
        >
          {user ? (
            <ShareOnOA agenda={agenda} event={event} />
          ) : (
            <UnloggedBody />
          )}
          <ShareOnSocialNetworks
            eventUrl={new URL(window.location.href)}
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
            eventUrl={new URL(window.location.href)}
            contentLocale={contentLocale}
          />
          <ShareLink absUrl={new URL(window.location.href)} />
        </AccordionRoot>
      </Bleed>
    </DialogBody>
  );
}
