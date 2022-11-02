import fetchLocale from './locales';

const flatten = (value = {}, preferredLang = 'fr') => value[preferredLang] ?? value[Object.keys(value).shift()];

export type EventShowProps = {
  agenda: {
    title: string
  }
  event: {
    title: Record<string, string>
  }
};

function EventShow({ agenda, event }: EventShowProps) {
  return (
    <div>
      <h1>Une autre page NextJs</h1>
      <h2>L&apos;événement: {flatten(event.title)}</h2>
      <h3>L&apos;agenda: {agenda.title}</h3>
    </div>
  );
}

EventShow.fetchLocale = fetchLocale;

export default EventShow;
