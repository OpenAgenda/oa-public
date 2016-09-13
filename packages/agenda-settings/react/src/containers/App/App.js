import React, { Component, PropTypes } from 'react';

export default class App extends Component {

  /* static contextTypes = {
    getLabel: React.PropTypes.func
  }; */

  render() {

    // const { getLabel } = this.context;

    return (
      <div className="page">
        <div className="container agenda-settings">
          {this.props.children}
        </div>
      </div>
    );
  }

}