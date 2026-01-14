import '@openagenda/bs-templates/compiled/main.css';

import { produce } from 'immer';

import LocationDetails from '../src/components/LocationDetails.js';
import Providers from './decorators/Providers.js';
import ComponentCanvas from './decorators/ComponentCanvas.js';

import agendaFixture from './fixtures/mel.json';
import locationFixture from './fixtures/location.json';
import settingsFixture from './fixtures/agendaTestSettings.json';

export default {
  title: 'LocationDetails',
  decorators: [ComponentCanvas, Providers],
};

const geoapifyKey = process.env.STORYBOOK_GEOAPIFY_KEY;

export const BasicCase = () => (
  <LocationDetails
    res={{}}
    agenda={agendaFixture}
    location={locationFixture}
    lang="fr"
    settings={settingsFixture}
    staticTiles={`https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%231d77ce;size:small&apiKey=${geoapifyKey}`}
  />
);

export const WithSIRET = () => (
  <LocationDetails
    res={{}}
    agenda={agendaFixture}
    location={produce(locationFixture, (draft) => {
      draft.siret = '12345678901234';
    })}
    lang="fr"
    settings={settingsFixture}
    staticTiles={`https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%231d77ce;size:small&apiKey=${geoapifyKey}`}
  />
);
