import { useState, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Spinner } from '@openagenda/react-shared';
import LocationDetails from './LocationDetailsConfirm.js';

const messages = defineMessages({
  confirm: {
    id: 'AgendaLocations.LocationConfirmation.confirm',
    defaultMessage: 'Confirm',
  },
  cancel: {
    id: 'AgendaLocations.LocationConfirmation.cancel',
    defaultMessage: 'Select another location',
  },
});

const LocationConfirmation = ({
  res,
  location,
  lang,
  settings,
  onConfirm,
  onCancel,
}) => {
  const [detailedLocation, setDetailedLocation] = useState();

  useEffect(() => {
    fetch(res.get.replace(':locationUid', location.uid), {}).then(
      async (response) => {
        if (!response.ok) return;
        setDetailedLocation(await response.json());
      },
    );
  }, [res.get, location.uid]);

  if (!detailedLocation) {
    return <Spinner page />;
  }

  return (
    <div>
      <LocationDetails
        res={res}
        location={detailedLocation}
        lang={lang}
        settings={settings}
        staticTiles={res.staticTiles}
      />
      <div className="margin-bottom-sm text-center">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-default margin-bottom-sm margin-right-sm"
        >
          <FormattedMessage {...messages.cancel} />
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="btn btn-primary margin-bottom-sm"
        >
          <FormattedMessage {...messages.confirm} />
        </button>
      </div>
    </div>
  );
};

export default LocationConfirmation;
