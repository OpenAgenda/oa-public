import { http, HttpResponse } from 'msw';
import { LayoutDataContext } from '@openagenda/react-shared';
import { useMemo } from 'react';
import PassSettings from '../src/components/PassSettings.js';
import IntlProviderDecorator from './decorators/IntlProvider.js';

// Sample venue data for the mock API response
const venuesData = {
  offererVenues: [
    {
      offerer: {
        name: 'Main Offerer',
      },
      venues: [
        {
          id: 548,
          publicName: 'Venue 1',
          location: {
            address: '123 Main St',
            postalCode: '75000',
            city: 'Paris',
          },
        },
        {
          id: 549,
          publicName: 'Venue 2',
          location: {
            address: '456 Second St',
            postalCode: '75001',
            city: 'Paris',
          },
        },
      ],
    },
  ],
};

// Create a wrapper component that provides the necessary context
const PassSettingsWrapper = ({ agendaData, children }) => {
  // Make sure the agenda.uid is 83549053 to match the MSW mock
  const agenda = useMemo(
    () => ({
      ...agendaData,
      uid: 83549053,
    }),
    [agendaData],
  );

  const contextValue = useMemo(() => ({ agenda }), [agenda]);

  return (
    <LayoutDataContext.Provider value={contextValue}>
      {children}
    </LayoutDataContext.Provider>
  );
};

export default {
  title: 'PassSettings',
  component: PassSettings,
  decorators: [IntlProviderDecorator],
  parameters: {
    msw: {
      handlers: [
        // Mock the API call to get the venues
        http.get('/api/agendas/83549053/settings/passCulture', () =>
          HttpResponse.json(venuesData)),
        // Mock the API call to save the default venue
        http.post('/api/agendas/83549053/settings/passCulture', () =>
          HttpResponse.json({ success: true })),
      ],
    },
  },
};

// Initial state - No SIREN set
export const InitialState = () => (
  <PassSettingsWrapper
    agendaData={{
      uid: 83549053,
      official: true,
      settings: {},
    }}
  >
    <div className="container">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <h2>Pass Culture Settings</h2>
          <PassSettings />
        </div>
      </div>
    </div>
  </PassSettingsWrapper>
);

// SIREN set but no default venue
export const SirenSet = () => (
  <PassSettingsWrapper
    agendaData={{
      uid: 83549053,
      official: true,
      settings: {
        registration: {
          passCulture: {
            siren: '123456789',
          },
        },
      },
    }}
  >
    <div className="container">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <h2>Pass Culture Settings</h2>
          <PassSettings />
        </div>
      </div>
    </div>
  </PassSettingsWrapper>
);

// SIREN set and default venue selected
export const DefaultVenueSet = () => (
  <PassSettingsWrapper
    agendaData={{
      uid: 83549053,
      official: true,
      settings: {
        registration: {
          passCulture: {
            siren: '123456789',
            defaultVenueId: 548,
          },
        },
      },
    }}
  >
    <div className="container">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <h2>Pass Culture Settings</h2>
          <PassSettings />
        </div>
      </div>
    </div>
  </PassSettingsWrapper>
);
