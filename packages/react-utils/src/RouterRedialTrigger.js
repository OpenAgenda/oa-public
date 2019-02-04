import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Route } from 'react-router';
import { trigger } from 'redial';
// import NProgress from 'nprogress';
import asyncMatchRoutes from './asyncMatchRoutes';

async function triggerLocation( { location, history, routes, helpers } ) {
  // load data while the old screen remains
  const { components, match, params } = await asyncMatchRoutes( routes, location.pathname );
  const triggerLocals = {
    ...helpers,
    match,
    params,
    history,
    location
  };

  // Don't fetch data for initial route, server has already done the work:
  if ( typeof window !== 'undefined' && window.__PRELOADED__ ) {
    // Delete initial data so that subsequent data fetches can occur:
    delete window.__PRELOADED__;
  } else {
    // Fetch mandatory data dependencies for 2nd route change onwards:
    await trigger( 'fetch', components, triggerLocals );
  }

  if ( typeof window !== 'undefined' ) {
    await trigger( 'defer', components, triggerLocals );
  }
};

@withRouter
class RouterRedialTrigger extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    history: PropTypes.objectOf( PropTypes.any ).isRequired,
    location: PropTypes.objectOf( PropTypes.any ).isRequired
  };

  state = {
    needTrigger: false,
    location: null,
    previousLocation: null
  };

  static getDerivedStateFromProps( props, state ) {
    const { location, needTrigger } = state;

    if ( needTrigger ) {
      return null;
    }

    const {
      location: { pathname, search }
    } = props;

    const navigated = !location || `${pathname}${search}` !== `${location.pathname}${location.search}`;

    if ( navigated ) {
      return {
        needTrigger: true,
        location: props.location,
        previousLocation: props.location
      };
    }

    return null;
  }

  trigger = () => {
    const { location, history, routes, helpers } = this.props;

    if ( this.state.needTrigger && typeof window !== 'undefined' ) {
      this.setState( { needTrigger: false }, () => {
        triggerLocation( { location, history, routes, helpers } )
          .catch( () => null )
          .then( () => {
            // clear previousLocation so the next screen renders
            this.setState( { previousLocation: null } );
          } );
      } );
    }
  }

  componentDidMount() {
    this.trigger();
  }

  componentDidUpdate( prevProps, prevState ) {
    this.trigger();
  }

  // componentWillMount() {
  //   NProgress.configure( { trickleSpeed: 200 } );
  // }

  render() {
    const { children, location } = this.props;
    const { previousLocation } = this.state;

    // use a controlled <Route> to trick all descendants into
    // rendering the old location
    return <Route location={previousLocation || location} render={() => children} />;
  }
}

export default RouterRedialTrigger;
