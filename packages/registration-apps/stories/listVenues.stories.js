import { http, HttpResponse } from 'msw';
import BootstrapComponentsProvider from '../src/components/bootstrap/Provider.js';
import ListVenues from '../src/components/bootstrap/ListVenues.js';
import passSettings from './fixtures/passSettings.json' with { type: 'json' };

export default {
  title: 'PassCulture/ListVenues',
  parameters: {
    msw: {
      handlers: [http.get('/settings', () => HttpResponse.json(passSettings))],
    },
  },
  decorators: [
    (Story) => (
      <BootstrapComponentsProvider>
        <Story />
      </BootstrapComponentsProvider>
    ),
  ],
};

export const Default = () => (
  <ListVenues
    res={{
      settings: '/settings',
    }}
  />
);

export const WithDefaultVenue = () => (
  <ListVenues
    res={{
      settings: '/settings',
    }}
    defaultVenueId={548}
  />
);

export const SelectMode = () => (
  <ListVenues
    res={{
      settings: '/settings',
    }}
    mode="select"
    onSelect={(venueId) => {
      console.log(`Selected venue ID: ${venueId}`);
      alert(`Selected venue ID: ${venueId}`);
    }}
  />
);

export const SelectModeWithDefault = () => (
  <ListVenues
    res={{
      settings: '/settings',
    }}
    mode="select"
    defaultVenueId={548}
    onSelect={(venueId) => {
      console.log(`Selected venue ID: ${venueId}`);
      alert(`Selected venue ID: ${venueId}`);
    }}
  />
);
