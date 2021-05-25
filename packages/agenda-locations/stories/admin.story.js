import React from 'react';
import AdminApp from '../components/src/AgendaAdminLocations';
import Provider from '../components/src/Provider';

export default ({ settings, res, set }) => (
  <div className="top-margined col-sm-8 col-sm-offset-2 wsq content">
    <div className="js_locations_counter" data-res="http://localhost:3000/unverified"></div>
    <Provider lang="fr">
      <AdminApp
        agenda={{
          slug: 'theagendaslug',
          uid: 79882300
        }}
        detailedInfo
        settings={settings}
        set={set || null}
        lang="fr"
        enableGeocode
        res={res}
        tiles="https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f486f281abbe690750"
        staticTiles="https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%2341acdd;size:small&apiKey=9f8da49724b645f486f281abbe690750"
      />
    </Provider>
  </div>
);
