import { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import LocationForm from '../src/components/form-components/LocationForm';
import LocationMap from '../src/components/form-components/LocationMap';
import GeoFieldsAndMap from '../src/components/form-components/GeoFieldsAndMap';
import validate from '../src/validate';
import Providers from './decorators/Providers';
import ComponentCanvas from './decorators/ComponentCanvas';

import location from './fixtures/location.json';
import agendaSettings from './fixtures/agendaTestSettings.json';

export default {
  title: 'LocationFormComponents',
  decorators: [ComponentCanvas, Providers],
};

export const BasicForm = () => (
  <LocationForm
    locationProp={location}
    settings={agendaSettings}
    mode="update"
    res={{
      geocode: 'http://localhost:3000/api/agendas/:agendaUid/locations/geocode',
      reverseGeocode: 'http://localhost:3000/api/agendas/:agendaUid/locations/geocode/reverse',
    }}
  />
);

export const BasicGeoFieldsAndMap = () => {
  const [locationGeo, setLocation] = useState(null);
  return (
    <GeoFieldsAndMap
      lang="fr"
      location={locationGeo}
      validate={validate}
      onChange={setLocation}
      enableGeocode
      res={{
        geocode: 'http://localhost:3000/api/agendas/:agendaUid/locations/geocode',
        reverseGeocode: 'http://localhost:3000/api/agendas/:agendaUid/locations/geocode/reverse',
      }}
      agenda={{
        uid: 1,
      }}
    />
  );
};

export const BasicMap = () => (
  <LocationMap
    location={location}
    draggableMarker
  />
);
