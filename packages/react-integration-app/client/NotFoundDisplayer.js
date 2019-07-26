import React, { Component } from 'react'
import { matchRoutes } from '@openagenda/react-utils/dist/asyncMatchRoutes';

export default class NotFoundDisplayer extends Component {
  isNotFound = () => {
    const { history, apps } = this.props;

    return Object.values( apps )
      .every( app =>
        !( app.routes && matchRoutes( app.routes, history.location.pathname ).length )
      );
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
