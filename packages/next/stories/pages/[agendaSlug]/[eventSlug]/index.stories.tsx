import EventShow from 'pages/n/[agendaSlug]/events/[eventSlug]';
import EventShowView from 'views/EventShow';
import intlMessagesLoader from '../../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../../decorators/ProvidersDecorator';
import agendaFixtures from './fixtures/agenda.fake.json';
import agendaJEPFixtures from './fixtures/agenda.jep-2023-grand-est.json';

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
      />
    </EventShow.Layout>
  );
}
