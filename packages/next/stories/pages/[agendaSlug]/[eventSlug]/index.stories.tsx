import EventShow from 'pages/n/[agendaSlug]/events/[eventSlug]';
import EventShowView from 'views/EventShow';
import intlMessagesLoader from '../../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../../decorators/ProvidersDecorator';
import eventFixtures from '../../../fixtures/events/sample.json';
import agendaFixtures from './fixtures/agenda.fake.json';
import agendaJEPFixtures from './fixtures/agenda.jep-2023-grand-est.json';
import eventJEPFixtures from './fixtures/event.jep-2023-grand-est.json';

export default {
  title: 'pages/[agendaSlug]/events/[eventSlug]',
  component: EventShow,
  loaders: [
    intlMessagesLoader(EventShowView.fetchLocale),
  ],
  decorators: [
    ProvidersDecorator,
  ],
};

export function Sample(_args, { loaded: { intlMessages } }) {
  return (
    <EventShow.Layout>
      <EventShow
        intlMessages={intlMessages}
        agenda={agendaFixtures}
        event={eventFixtures}
      />
    </EventShow.Layout>
  );
}

export function JEP2023(_args, { loaded: { intlMessages } }) {
  return (
    <EventShow.Layout>
      <EventShow
        intlMessages={intlMessages}
        agenda={agendaJEPFixtures}
        event={eventJEPFixtures}
      />
    </EventShow.Layout>
  );
}
