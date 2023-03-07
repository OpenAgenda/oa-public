
import '@openagenda/bs-templates/compiled/main.css';

import LocationItem from '../src/components/LocationItem';
import ComponentCanvas from './decorators/ComponentCanvas';
import Providers from './decorators/Providers';

import agendaTestSettings from './fixtures/agendaTestSettings.json';
import location from './fixtures/location.json';

const defaultAccess = {
  authorized: true,
  external: false,
  serviceLabel: null,
  link: null
};

export default {
  title: 'LocationItem',
  decorators: [Providers, ComponentCanvas]
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
        delete: defaultAccess
      }
    }}
  />
);
