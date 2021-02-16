import React from 'react';
import AdminApp from '../components/src/AgendaAdminLocations';

export default ({ settings, res, set }) => (
  <div className="top-margined col-sm-8 col-sm-offset-2 wsq content">
<<<<<<< HEAD
    <div className="js_locations_counter" data-res="http://localhost:3000/unverified"></div>
=======
    <div className="js_locations_counter"></div>
>>>>>>> refactor(agenda-locations): component creation method update3
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
