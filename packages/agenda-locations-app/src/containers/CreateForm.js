import React from 'react';

import LocationForm from '../components/form-components/LocationForm';

const CreateForm = ({
  lang,
  enableGeocode,
  res,
  settings,
  tiles,
  detailedInfo
}) => (
  <LocationForm
    Header={false}
    showToggler={false}
    res={res}
    lang={lang}
    location={null}
    detailedInfo={detailedInfo}
    settings={settings}
    onCancel={false}
    onSuccess={false}
    enableGeocode={enableGeocode}
    postRes={res.create}
    tiles={tiles}
    mode="create"
  />
);

export default CreateForm;
