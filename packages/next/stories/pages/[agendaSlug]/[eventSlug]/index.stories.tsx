import Providers from 'Providers';
import EventShow from 'pages/n/[agendaSlug]/events/[eventSlug]';
import EventShowView from 'views/EventShow';
import agendaFixtures from './fixtures/agenda.fake.json';
import eventFixtures from './fixtures/event.fake.json';
import agendaJEPFixtures from './fixtures/agenda.jep-2023-grand-est.json';
import eventJEPFixtures from './fixtures/event.jep-2023-grand-est.json';

export default {
  title: 'pages/[agendaSlug]/events/[eventSlug]',
  component: EventShow,
  loaders: [
    async () => ({
      intlMessages: await EventShowView.fetchLocale('fr'),
    }),
  ],
};

export function Sample(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <EventShow.Layout>
        <EventShow
          intlMessages={intlMessages}
          agenda={agendaFixtures}
          event={eventFixtures}
        />
      </EventShow.Layout>
    </Providers>
  );
}

export function JEP2023(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <EventShow.Layout>
        <EventShow
          intlMessages={intlMessages}
          agenda={agendaJEPFixtures}
          event={eventJEPFixtures}
        />
      </EventShow.Layout>
    </Providers>
  );
}
