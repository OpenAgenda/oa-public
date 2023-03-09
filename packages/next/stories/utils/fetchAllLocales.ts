import AgendaShow from 'views/AgendaShow';
import EventShow from 'views/EventShow';

export default async function fetchAllLocales(locale) {
  return {
    ...await AgendaShow.fetchLocale(locale),
    ...await EventShow.fetchLocale(locale),
  };
}
