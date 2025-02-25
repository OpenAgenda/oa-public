import _ from 'lodash';
import moment from 'moment-timezone';

const convertOccurrenceValue = (date, time, timezone = 'Europe/Paris') =>
  moment
    .tz(`${moment(date).locale('en').format('YYYY-MM-DD')}T${time}`, timezone)
    .locale('en')
    .toISOString(true);

const assembleEventFromLegacyEntries = (entries) => {
  const event = entries.eventTranslations
    .map(({ lang, title, description, tags, free_text: longDescription }) => ({
      title,
      description,
      keywords: (tags ?? '').split(',').map((t) => t.trim()),
      longDescription,
      lang,
    }))
    .reduce(
      ({ title, description, longDescription, keywords }, entry) => ({
        title: { ...title, [entry.lang]: entry.title },
        description: { ...description, [entry.lang]: entry.description },
        longDescription: {
          ...longDescription,
          [entry.lang]: entry.longDescription,
        },
        keywords: { ...keywords, [entry.lang]: entry.keywords },
      }),
      {},
    );

  event.locationUid = entries.location?.uid;
  event.timezone = entries.location?.timezone;

  event.registration = (entries.eventLocation?.ticket_link ?? '')
    .split(',')
    .map((r) => r.trim());

  event.conditions = entries.eventLocationTranslations.reduce(
    (c, { lang, pricing_info: pricingInfo }) => ({
      ...c,
      [lang]: pricingInfo,
    }),
    {},
  );

  event.timings = entries.occurrences.map((o) => ({
    begin: convertOccurrenceValue(o.date, o.time_start, event.timezone),
    end: convertOccurrenceValue(o.date, o.time_end, event.timezone),
  }));

  if (entries.event.accessibility) {
    try {
      event.accessibility = JSON.parse(entries.event.accessibility ?? '[]')
        .filter((code) => code !== 'sl')
        .reduce(
          (carried, code) => ({
            ...carried,
            [code]: true,
          }),
          {
            ii: false,
            mi: false,
            pi: false,
            hi: false,
            vi: false,
          },
        );
    } catch (e) {
      // meh
    }
  }

  try {
    event.links = JSON.parse(entries.event.store)
      .links.filter((link) => link.code)
      .map(({ link, code }) => ({
        type: 'oembed',
        link,
        data: {
          html: code,
          url: link,
        },
      }));
  } catch (e) {
    // meh
  }

  if (entries.event.image) {
    event.image = {
      filename: entries.event.image,
      variants: [
        {
          type: 'full',
          filename: `evf${entries.event.image}`,
        },
        {
          type: 'thumbnail',
          filename: `evtb${entries.event.image}`,
        },
      ],
    };
    event.imageCredits = entries.event?.image_credits ?? '';
  }

  [
    'uid',
    'slug',
    ['file_key', 'fileKey'],
    ['origin_uid', 'agendaUid'],
    ['age_min', 'age.min'],
    ['age_max', 'age.max'],
  ]
    .map((v) => (Array.isArray(v) ? v : [v, v]))
    .forEach(([from, to]) => {
      _.set(event, to, entries?.event?.[from] ?? null);
    });

  return event;
};

export default assembleEventFromLegacyEntries;
