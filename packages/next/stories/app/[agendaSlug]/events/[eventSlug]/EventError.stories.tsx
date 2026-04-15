import EventError from '@/src/app/[locale]/[agendaSlug]/events/[eventSlug]/_components/EventError';
import AppLayout from 'components/app/Layout';
import { Agenda } from 'types';
import intlMessagesLoader from '../../../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../../../decorators/ProvidersDecorator';
import fetchLocale from '../../../../utils/fetchLocale';
import agendaFixtures from './fixtures/agenda.fake.json';

const agenda = agendaFixtures as Agenda;

export default {
  title: 'app/[agendaSlug]/events/[eventSlug]/EventError',
  component: EventError,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: `/fr/${agenda.slug}/events/missing`,
        segments: [
          ['locale', 'fr'],
          ['agendaSlug', agenda.slug],
          ['eventSlug', 'missing'],
        ],
      },
    },
  },
};

export const Unauthorized = {
  render: () => (
    <AppLayout>
      <EventError
        statusCode={401}
        agendaSlug={agenda.slug}
        eventSlug="missing"
        agenda={agenda}
      />
    </AppLayout>
  ),
};

export const Forbidden = {
  render: () => (
    <AppLayout>
      <EventError
        statusCode={403}
        agendaSlug={agenda.slug}
        eventSlug="missing"
        agenda={agenda}
      />
    </AppLayout>
  ),
};

export const NotFoundWithAgenda = {
  render: () => (
    <AppLayout>
      <EventError
        statusCode={404}
        agendaSlug={agenda.slug}
        eventSlug="missing"
        agenda={agenda}
      />
    </AppLayout>
  ),
};

export const NotFoundWithoutAgenda = {
  render: () => (
    <AppLayout>
      <EventError
        statusCode={404}
        agendaSlug="unknown-agenda"
        eventSlug="missing"
      />
    </AppLayout>
  ),
};

export const ServerError = {
  render: () => {
    const error = new Error('Something went wrong on the server');
    error.stack =
      'Error: Something went wrong\n    at fetchEvent (_api/index.ts:72:10)';
    return (
      <AppLayout>
        <EventError
          statusCode={500}
          agendaSlug={agenda.slug}
          eventSlug="missing"
          agenda={agenda}
          error={error}
        />
      </AppLayout>
    );
  },
};
