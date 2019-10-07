import React, { PureComponent } from 'react';
import { withRouter } from 'react-router';

@withRouter
export default class ScrollToTop extends PureComponent {
  componentDidUpdate( prevProps ) {
    if ( this.props.location.pathname !== prevProps.location.pathname ) {
      window.scrollTo( 0, 0 );
    }
  }

  render() {
    return this.props.children || null;
  }
}
