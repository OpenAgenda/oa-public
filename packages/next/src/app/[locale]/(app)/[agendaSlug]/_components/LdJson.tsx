import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { formatInTimeZone } from 'date-fns-tz';
import stringify from 'fast-json-stable-stringify';
import { toEventSchema } from '@openagenda/sdk-js';
import useEventsQuery from '../_hooks/useEventsQuery';

export default function LdJson({ agenda, filters, query }) {
  const intl = useIntl();

  const { data: pages } = useEventsQuery({
    suspense: true,
    agenda,
    filters,
    query,
  });

  const eventsLdJSON = useMemo(() => {
    const eventSchemas = pages
      ?.flatMap((p) => p.events)
      .map((event) =>
        toEventSchema(event, {
          locale: intl.locale,
          formatDate: (date, tz = 'Europe/Paris') =>
            formatInTimeZone(date, tz, "yyyy-MM-dd'T'HH:mm:ssXXX"),
          url: `${process.env.NEXT_PUBLIC_ROOT}/${agenda.slug}/events/${event.slug}`,
        }),
      );
    return stringify({
      '@context': 'https://schema.org',
      '@graph': eventSchemas,
    });
  }, [agenda.slug, intl.locale, pages]);

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: eventsLdJSON }}
    />
  );
}
