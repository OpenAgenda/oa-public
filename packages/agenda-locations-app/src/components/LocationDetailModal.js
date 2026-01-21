import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Spinner, Modal } from '@openagenda/react-shared';
import LocationDetails from './LocationDetails.js';
import NotFoundLocationModal from './NotFoundLocationModal.js';
import DeletedLocationModal from './DeletedLocationModal.js';

const LocationDetailModal = ({
  locationUid,
  res,
  settings,
  agenda,
  closeDetail,
  lang,
  onEdit,
  prefix,
}) => {
  const staticTiles = useSelector((state) => state.settings.staticTiles);
  const [detailedLocation, setDetailedLocation] = useState();
  const [deletedLocation, setDeletedLocation] = useState(null);
  const [unfoundLocation, setUnfoundLocation] = useState(false);

  useEffect(() => {
    const url = `${res.get.replace(':locationUid', locationUid)}${res.get.includes('?') ? '&' : '?'}includeLinkedAgendas=true&deleted=null`;
    fetch(url)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Invalid status (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        const loc = data.location;
        // Check if location is deleted
        if (loc && loc.deleted === 1) {
          setDeletedLocation(loc);
          return;
        }
        if (loc) {
          setDetailedLocation(loc);
        } else {
          setUnfoundLocation(true);
        }
      })
      .catch((_err) => {
        setUnfoundLocation(true);
      });
  }, [res.get, locationUid]);

  if (deletedLocation) {
    return (
      <DeletedLocationModal
        close={closeDetail}
        mergedIn={deletedLocation.mergedIn}
        prefix={prefix}
        mode="detail"
      />
    );
  }

  if (unfoundLocation) {
    return <NotFoundLocationModal close={closeDetail} />;
  }

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
          onEdit={onEdit}
        />
      </Modal>
    );
  }

  return <Spinner page />;
};

export default LocationDetailModal;
