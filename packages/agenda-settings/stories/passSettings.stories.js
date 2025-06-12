import { http, HttpResponse } from 'msw';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { LayoutDataContext } from '@openagenda/react-shared';
import { useMemo } from 'react';
import PassSettings from '../src/components/PassSettings.js';
import agendaReducer from '../src/reducers/agenda.js';
import keysReducer from '../src/reducers/keys.js';
import modalsReducer from '../src/reducers/modals.js';
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

// Empty venues data for no venues scenario
const noVenuesData = {
  offererVenues: [],
};

// Create Redux store with the necessary reducers
const rootReducer = combineReducers({
  agenda: agendaReducer,
  keys: keysReducer,
  modals: modalsReducer,
});

const store = createStore(rootReducer, {
  agenda: { loading: false },
  keys: {},
  modals: {},
});

// Create a wrapper component that provides both Redux and Layout context
const PassSettingsWrapper = ({ agendaData, children }) => {
  const agenda = useMemo(
    () => ({
      ...agendaData,
      uid: 83549053,
    }),
    [agendaData],
  );

  const contextValue = useMemo(() => ({ agenda }), [agenda]);

  return (
    <Provider store={store}>
      <LayoutDataContext.Provider value={contextValue}>
        {children}
      </LayoutDataContext.Provider>
    </Provider>
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

// SIREN set but no venues found
export const SirenSetNoVenues = {
  parameters: {
    msw: {
      handlers: [
        // Mock the API call to return no venues
        http.get('/api/agendas/83549053/settings/passCulture', () =>
          HttpResponse.json(noVenuesData)),
        // Mock the API call to save the default venue
        http.post('/api/agendas/83549053/settings/passCulture', () =>
          HttpResponse.json({ success: true })),
      ],
    },
  },
  render: () => (
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
  ),
};
