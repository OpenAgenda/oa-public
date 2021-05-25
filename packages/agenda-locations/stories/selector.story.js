import React, { Component } from 'react';
import debug from 'debug';

import SelectorApp from '../components/src/LocationSelector';
import Provider from '../components/src/Provider';

const log = debug('selectorStory');

class BaseSelectorStory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      location: props.initialLocation,
      mode: props.mode,
    };
  }

  render() {
    return (
      <div className="top-margined col-sm-6 col-sm-offset-3 wsq content">
        <Provider lang="fr">
          <SelectorApp
            tiles='https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f486f281abbe690750'
            staticTiles='https://maps.geoapify.com/v1/staticmap?style=osm-carto&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&apiKey=9f8da49724b645f486f281abbe690750'
            settings={this.props.settings}
            location={this.state.location}
            mode={this.state.mode}
            lang="fr"
            allowCreate={true}
            confirmRequired={this.props.confirmRequired}
            res={this.props.res}
            enableGeocode={this.props.enableGeocode}
            onChange={(mode, location) => {
              this.setState({ location, mode });
            }}
            disableChange={false}
          />
        </Provider>
      </div>

    );
  }
}

export default props => <BaseSelectorStory {...props} />;
