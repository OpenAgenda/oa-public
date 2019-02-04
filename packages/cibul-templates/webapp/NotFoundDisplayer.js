import React, { Component } from 'react';

export default class NotFoundDisplayer extends Component {
  isNotFound = () => Object.values( this.props.apps )
    .filter( app => app.history )
    .map( app => ({
      state: (app.history.location.state || {}),
      notFoundKey: app.notFoundKey
    }) )
    .every( ( { state, notFoundKey } ) => (state.notFound && state.notFound[ notFoundKey ]) );

  state = {
    display: this.isNotFound()
  };

  componentDidMount() {
    this.handleLocationChange();
  }

  handleLocationChange = () => {
    const display = this.isNotFound();

    if ( display !== this.props.display ) {
      this.setState( { display } );
    }
  }

  unlisten = this.props.history.listen( this.handleLocationChange );

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    const { children } = this.props;
    const { display } = this.state;

    return display && children ? children : null;
  }
}
