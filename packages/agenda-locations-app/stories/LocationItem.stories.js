import '@openagenda/bs-templates/compiled/main.css';

import LocationItem from '../src/components/LocationItem.js';
import ComponentCanvas from './decorators/ComponentCanvas.js';
import Providers from './decorators/Providers.js';

import agendaTestSettings from './fixtures/agendaTestSettings.json';
import location from './fixtures/location.json';

const defaultAccess = {
  authorized: true,
  external: false,
  serviceLabel: null,
  link: null,
};

export default {
  title: 'LocationItem',
  decorators: [Providers, ComponentCanvas],
};

export const test = () => (
  <LocationItem
    getCountryLabel={() => 'test'}
    location={location}
    onSelect={() => null}
    settings={{
      ...agendaTestSettings,
      access: {
        create: defaultAccess,
        update: defaultAccess,
        merge: defaultAccess,
        delete: defaultAccess,
      },
    }}
  />
);

export const BDLtest = () => (
  <LocationItem
    getCountryLabel={() => 'testBDL'}
    location={{
      ...location,
      extIds: [
        { key: 'default', value: '1221HHH34' },
        { key: 'test', value: 1 },
      ],
    }}
    onSelect={() => null}
    settings={{
      ...agendaTestSettings,
      access: {
        create: defaultAccess,
        update: defaultAccess,
        merge: defaultAccess,
        delete: defaultAccess,
      },
      locations: {
        actions: {
          edit: {
            key: 'default',
            link: 'https://basedeslieux.culture.gouv.fr/lieux/{value}',
            defaultLabel: 'BDL',
          },
          show: {
            key: 'default',
            link: 'https://basedeslieux.culture.gouv.fr/carte#/pinpoints/{value}',
            defaultLabel: 'BDL',
          },
          remove: {
            key: 'test',
            link: 'ret/{value}',
          },
        },
      },
    }}
  />
);
