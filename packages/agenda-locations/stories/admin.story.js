import React from 'react';
import AdminApp from '../components/src/AgendaAdminLocations';

export default ({ settings, res, set }) => (
  <div className="top-margined col-sm-8 col-sm-offset-2 wsq content">
    <div className="js_locations_counter" data-res="http://localhost:3000/unverified"></div>
    <AdminApp
      agenda={{
        slug: 'theagendaslug',
      }}
      detailedInfo={true}
      settings={settings}
      set={set || null}
      lang="fr"
      enableGeocode={true}
      res={res}
      tiles='https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f486f281abbe690750'
      staticTiles='https://maps.geoapify.com/v1/staticmap?style=osm-carto&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&apiKey=9f8da49724b645f486f281abbe690750'
    />
  </div>
);
