import { toEventSchema } from '@openagenda/sdk-js';
import { formatInTimeZone } from 'date-fns-tz';

export default async function sendJSONLD(req, res) {
  const { core } = req.app.services;

  const { root } = core.getConfig();

  const items = [];

  for await (const event of req.result) {
    items.push(
      toEventSchema(event, {
        locale: req.lang,
        formatDate: (date, tz = 'Europe/Paris') =>
          formatInTimeZone(date, tz, "yyyy-MM-dd'T'HH:mm:ssXXX"),
        url: event.originAgenda
          ? `${root}/${event.originAgenda.slug}/events/${event.uid}_${event.slug}`
          : `${root}/events/${event.uid}`,
      }),
    );
  }

  res.json(items);
}
