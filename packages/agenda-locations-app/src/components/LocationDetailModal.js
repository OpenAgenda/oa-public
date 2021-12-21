import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import { Spinner, Modal } from '@openagenda/react-shared';
import LocationDetails from './LocationDetails';

const LocationDetailModal = ({
  locationUid,
  res,
  settings,
  agenda,
  search,
  prefix
}) => {
  const history = useHistory();
  const staticTiles = useSelector(state => state.settings.staticTiles);
  const [detailedLocation, setDetailedLocation] = useState();
  useEffect(() => {
    axios.get(res.get.replace(':locationUid', locationUid), { includeLinkedAgendas: true }).then(response => {
      const { data } = response;
      console.log('renderDetailModal', data);
      setDetailedLocation(data);
    });
  }, []);

  if (detailedLocation) {
    return (
      <Modal
        title={detailedLocation?.name}
        classNames={{ overlay: 'popup-overlay big' }}
        onClose={() => history.push({ pathname: prefix, search })}
      >
        <LocationDetails
          res={res}
          location={detailedLocation}
          lang="FR"
          settings={settings}
          hover={false}
          staticTiles={staticTiles}
          agenda={agenda}
        />
      </Modal>
    );
  }
  return (
    <Modal
      title="Loading"
      classNames={{ overlay: 'popup-overlay big' }}
      onClose={() => history.push({ pathname: prefix, search })}
    >
      <Spinner
        mode="inline"
        options={{
          width: 2,
          length: 3,
          radius: 4,
          color: '#666',
        }}
      />
    </Modal>
  );
};

export default LocationDetailModal;
