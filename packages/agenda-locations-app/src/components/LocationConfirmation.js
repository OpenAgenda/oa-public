import React, { useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import LocationDetails from './LocationDetails';

const messages = defineMessages({
  guide: {
    id: 'AgendaLocations.LocationConfirmation.guide',
    defaultMessage: 'Are the details of this location correct ?',
  },
  guideDetail: {
    id: 'AgendaLocations.LocationConfirmation.guideDetail',
    defaultMessage: 'If some changes have to be made, click on the button below to provide details on the change to agenda administrators',
  },
  suggest: {
    id: 'AgendaLocations.LocationConfirmation.suggest',
    defaultMessage: 'Suggest a change',
  },
  suggestChangeMessage: {
    id: 'AgendaLocations.LocationConfirmation.suggestChangeMessage',
    defaultMessage: 'A new tab was opened in your browser. Provide the details of the change in the dialog before confirming your selection',
  },
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
  staticMapTiles
}) => {
  const [suggestChangeMessage, setSuggestChangeMessage] = useState(false);

  return (
    <div>
      <div className="margin-top-md">
        <label htmlFor="guide"><FormattedMessage {...messages.guide} /></label>
        <p><FormattedMessage {...messages.guideDetail} /></p>
      </div>
      <div className="info-block margin-bottom-md text-center">
        <div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={res.suggestChange.replace(':locationUid', location.uid)}
            onClick={() => setSuggestChangeMessage(true)}
            className="btn btn-default margin-h-sm margin-bottom-sm"
          >
            <FormattedMessage {...messages.suggest} />
          </a>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-default margin-bottom-sm"
          >
            <FormattedMessage {...messages.cancel} />
          </button>
          {suggestChangeMessage ? (
            <div className="margin-bottom-sm">
              <FormattedMessage {...messages.suggestChangeMessage} />
            </div>
          ) : null}
        </div>
        <div>
          <button type="button" onClick={onConfirm} className="btn btn-primary margin-h-sm">
            <FormattedMessage {...messages.confirm} />
          </button>
        </div>
      </div>
      <LocationDetails
        res={res}
        location={location}
        lang={lang}
        settings={settings}
        staticMapTiles={staticMapTiles}
        hover
      />
    </div>
  );
};

export default props => <LocationConfirmation {...props} />;
