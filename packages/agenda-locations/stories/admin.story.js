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
    />
  </div>
);
