import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import axios from 'axios';

import { Spinner, Modal } from '@openagenda/react-shared';
import LocationDetails from './LocationDetails';

const messages = defineMessages({
  removedMessage: {
    id: 'AgendaLocations.LocationDetailModal.removedMessage',
    defaultMessage: 'The location you are looking for has been removed',
  },
  removedModalTitle: {
    id: 'AgendaLocations.LocationDetailModal.removedModalTitle',
    defaultMessage: 'Removed Location',
  },
});

const LocationDetailModal = ({
  locationUid,
  res,
  settings,
  agenda,
  closeDetail,
  lang,
}) => {
  const intl = useIntl();
  const staticTiles = useSelector(state => state.settings.staticTiles);
  const [detailedLocation, setDetailedLocation] = useState();
  const [removedLocation, setRemovedLocation] = useState(false);

  useEffect(() => {
    axios.get(res.get.replace(':locationUid', locationUid), { includeLinkedAgendas: true }).then(response => {
      const { data } = response;
      if (data.location) setDetailedLocation(data.location);
      else setRemovedLocation(true);
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
  if (removedLocation) {
    return (
      <Modal
        title={intl.formatMessage(messages.removedModalTitle)}
        classNames={{ overlay: 'popup-overlay big' }}
        onClose={closeDetail}
      >
        <div>{intl.formatMessage(messages.removedMessage)}</div>
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
