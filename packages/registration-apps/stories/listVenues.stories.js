import { http, HttpResponse } from 'msw';
import BootstrapComponentsProvider from '../src/components/bootstrap/Provider';
import ListVenues from '../src/components/bootstrap/ListVenues';
import passSettings from './fixtures/passSettings.json';

export default {
  title: 'PassCulture/ListVenues',
  parameters: {
    msw: {
      handlers: [
        http.get('/settings', () => HttpResponse.json(passSettings)),
      ],
    },
  },
  decorators: [Story => (
    <BootstrapComponentsProvider><Story /></BootstrapComponentsProvider>
  )],
};

export const Default = () => (
  <ListVenues
    res={{
      settings: '/settings',
    }}
  />
);
