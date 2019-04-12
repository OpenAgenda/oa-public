import React, { Component } from 'react';

export default class NotFoundDisplayer extends Component {
  isNotFound = () => {
    const { history } = this.props;
    const state = history.location.state || {};

    return Object.values( history.apps )
      .filter( app => app.notFoundKey )
      .map( app => app.notFoundKey )
      .every( notFoundKey => (state.notFound && state.notFound[ notFoundKey ]) );
  };

  state = {
    display: this.isNotFound()
  };

  componentDidMount() {
    this.handleLocationChange();
  }

  handleLocationChange = () => {
    const display = this.isNotFound();

    if ( display !== this.state.display ) {
      this.setState( { display } );
    }
  };

  unlisten = this.props.history.listen( this.handleLocationChange );

  componentWillUnmount() {
    this.unlisten();
  }

  shouldComponentUpdate( nextProps, nextState ) {
    return this.state.display !== nextState.display;
  }

  render() {
    const { children } = this.props;
    const { display } = this.state;

    return display && children ? children : null;
  }
}
