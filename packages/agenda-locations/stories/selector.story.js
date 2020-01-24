import React, { Component } from 'react';

import SelectorApp from '../components/src/LocationSelector';

class BaseSelectorStory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      location: props.initialLocation,
      mode: props.mode
    }
  }

  render() {
    return <div className="top-margined col-sm-8 col-sm-offset-2 wsq content">
      <SelectorApp
        settings={this.props.settings}
        location={this.state.location}
        mode={this.state.mode}
        lang="fr"
        allowCreate={true}
        res={this.props.res}
        enableGeocode={this.props.enableGeocode}
        onChange={(location, mode) => {
          console.log(location);
          this.setState({ location, mode });
        }}
        onChangeMode={(mode, location) => {
          console.log(location);
          this.setState({ location, mode });
        }}
        disableChange={false}
      />
    </div>
  }

}

export default props => <BaseSelectorStory {...props} />
