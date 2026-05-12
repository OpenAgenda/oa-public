import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { formatInTimeZone } from 'date-fns-tz';
import stringify from 'fast-json-stable-stringify';
import { toEventSchema } from '@openagenda/sdk-js';
import useEvent from '../_hooks/useEvent';
import { useAgenda } from '../_context/agenda';

export default function LdJson() {
  const intl = useIntl();

  const agenda = useAgenda();
  const { event } = useEvent();

  const eventLdJSON = useMemo(
    () =>
      stringify(
        toEventSchema(event, {
          locale: intl.locale,
          formatDate: (date, tz = 'Europe/Paris') =>
            formatInTimeZone(date, tz, "yyyy-MM-dd'T'HH:mm:ssXXX"),
          url: `${process.env.NEXT_PUBLIC_ROOT}/${intl.locale}/${agenda.slug}/events/${event.uid}_${event.slug}`,
        }),
      ),
    [agenda.slug, intl.locale, event],
  );

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: eventLdJSON }}
    />
  );
}
