import React, { Component } from 'react';
import debug from 'debug';

import makeLabelGetter from '@openagenda/labels';
import confirmationLabels from '@openagenda/labels/agenda-locations/confirmation';

import LocationDetails from './LocationDetails';

const log = debug('locationConfirmation');
const getLabel = makeLabelGetter(confirmationLabels);

class LocationConfirmation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      suggestChangeMessage: false,
    };
  }

  render() {
    const {
      res,
      location,
      lang,
      settings,
      onConfirm,
      onCancel,
      staticMapTiles
    } = this.props;

    const { suggestChangeMessage } = this.state;

    return (
      <div>
        <div className="margin-top-md">
          <label htmlFor="guide">{getLabel('guide', lang)}</label>
          <p>{getLabel('guideDetail', lang)}</p>
        </div>
        <div className="info-block margin-bottom-md text-center">
          <div>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={res.suggestChange.replace(':locationUid', location.uid)}
              onClick={() => this.setState({ suggestChangeMessage: true })}
              className="btn btn-default margin-h-sm margin-bottom-sm"
            >
              {getLabel('suggest', lang)}
            </a>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-default margin-bottom-sm"
            >
              {getLabel('cancel', lang)}
            </button>
            {suggestChangeMessage ? (
              <div className="margin-bottom-sm">
                {getLabel('suggestChangeMessage', lang)}
              </div>
            ) : null}
          </div>
          <div>
            <button type="button" onClick={onConfirm} className="btn btn-primary margin-h-sm">
              {getLabel('confirm', lang)}
            </button>
          </div>
        </div>
        <LocationDetails
          location={location}
          lang={lang}
          settings={settings}
          staticMapTiles={staticMapTiles}
          hover
        />
      </div>
    );
  }
}

export default props => <LocationConfirmation {...props} />;
