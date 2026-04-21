import AgendaError from '@/src/app/[locale]/(app)/[agendaSlug]/_components/AgendaError';
import AppLayout from 'components/Layout';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import fetchLocale from '../../utils/fetchLocale';

export default {
  title: 'app/[agendaSlug]/AgendaError',
  component: AgendaError,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/fr/some-private-agenda',
      },
    },
  },
};

export const Unauthorized = {
  render: () => (
    <AppLayout>
      <AgendaError statusCode={401} agendaSlug="some-private-agenda" />
    </AppLayout>
  ),
};

export const Forbidden = {
  render: () => (
    <AppLayout>
      <AgendaError statusCode={403} agendaSlug="some-private-agenda" />
    </AppLayout>
  ),
};

export const NotFound = {
  render: () => (
    <AppLayout>
      <AgendaError statusCode={404} />
    </AppLayout>
  ),
};

export const ServerError = {
  render: () => {
    const error = new Error('Something went wrong on the server');
    error.stack =
      'Error: Something went wrong\n    at fetchAgenda (_api/index.ts:42:10)';
    return (
      <AppLayout>
        <AgendaError statusCode={500} error={error} />
      </AppLayout>
    );
  },
};
