import React, { Component } from 'react';
import debug from 'debug';

import SelectorApp from '../components/src/LocationSelector';

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
        <SelectorApp
          mapboxKey="pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow"
          settings={this.props.settings}
          location={this.state.location}
          mode={this.state.mode}
          lang="fr"
          allowCreate={true}
          confirmRequired={this.props.confirmRequired}
          res={this.props.res}
          enableGeocode={this.props.enableGeocode}
          onChange={(mode, location) => {
            log('onChange', mode);
            log('location:', location);
            this.setState({ location, mode });
          }}
          disableChange={false}
        />
      </div>
    );
  }
}

export default props => <BaseSelectorStory {...props} />;
