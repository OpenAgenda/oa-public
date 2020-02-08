import React from 'react';

import AdminApp from '../components/src/AgendaAdminLocations';

export default ({
  settings,
  res
}) => <div className="top-margined col-sm-8 col-sm-offset-2 wsq content">
  <AdminApp
    agenda={{
      slug: 'theagendaslug'
    }}
    detailedInfo={true}
    settings={settings}
    lang="fr"
    enableGeocode={true}
    res={res}
  />
</div>
