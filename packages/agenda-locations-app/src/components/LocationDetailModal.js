import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

import { Spinner, Modal } from '@openagenda/react-shared';
import LocationDetails from './LocationDetails';

const LocationDetailModal = ({
  locationUid,
  res,
  settings,
  agenda,
  closeDetail,
  lang
}) => {
  const staticTiles = useSelector(state => state.settings.staticTiles);
  const [detailedLocation, setDetailedLocation] = useState();
  useEffect(() => {
    axios.get(res.get.replace(':locationUid', locationUid), { includeLinkedAgendas: true }).then(response => {
      const { data } = response;
      setDetailedLocation(data.location);
    });
  }, [res.get, locationUid]);

  if (detailedLocation) {
    return (
      <Modal
        title={detailedLocation?.name}
        classNames={{ overlay: 'popup-overlay big' }}
        onClose={closeDetail}
      >
        <LocationDetails
          res={res}
          location={detailedLocation}
          lang={lang}
          settings={settings}
          hover={false}
          staticTiles={staticTiles}
          agenda={agenda}
        />
      </Modal>
    );
  }
  return (
    <Spinner
      page
    />
  );
};

export default LocationDetailModal;
