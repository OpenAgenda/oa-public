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

  await trigger( 'fetch', components, triggerLocals );

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

    console.log( 'NEW PROPS', props, state );
    console.log( '=> navigated', navigated );

    if ( navigated ) {
      return {
        needTrigger: true,
        location: props.location,
        previousLocation: props.location
      };
    }

    return null;
  }

  componentDidMount() {
    const { location, history, routes, helpers } = this.props;

    this.setState( {
      ...this.state,
      needTrigger: false
    } );

    if ( this.state.needTrigger ) {
      console.log( 'NEED TRIGGER', this.props.location, this.state );

      triggerLocation( { location, history, routes, helpers } )
        .catch( () => null )
        .then( () => {
          // clear previousLocation so the next screen renders
          this.setState( { ...this.state, previousLocation: null, needTrigger: false } );
        } );
    }
  }

  componentDidUpdate( prevProps, prevState ) {
    const { location, history, routes, helpers } = this.props;

    if ( this.state.needTrigger ) {
      console.log( prevProps, prevState );
      console.log( 'NEED TRIGGER', this.props.location, this.state );

      triggerLocation( { location, history, routes, helpers } )
        .catch( () => null )
        .then( () => {
          // clear previousLocation so the next screen renders
          this.setState( { ...this.state, previousLocation: null, needTrigger: false } );
        } )
    }
  }

  // componentWillMount() {
  //   NProgress.configure( { trickleSpeed: 200 } );
  // }

  async componentWillReceiveProps( nextProps ) {
    const { location } = this.props;
    const {
      location: { pathname, search }
    } = nextProps;

    const navigated = `${pathname}${search}` !== `${location.pathname}${location.search}`;
    // const notFoundRetrieved = !(this.props.location.state || {}).notFound && (nextProps.location.state || {}).notFound;

    if ( navigated /* || (!navigated && notFoundRetrieved) */ ) {
      // save the location so we can render the old screen
      // NProgress.start();
      this.setState( { ...this.state, previousLocation: location } );

      await triggerLocation( nextProps.location ).catch( () => null );

      // clear previousLocation so the next screen renders
      this.setState( { ...this.state, previousLocation: null } );
      // NProgress.done();
    }
  }

  render() {
    const { children, location } = this.props;
    const { previousLocation } = this.state;

    // use a controlled <Route> to trick all descendants into
    // rendering the old location
    return <Route location={previousLocation || location} render={() => children} />;
  }
}

export default RouterRedialTrigger;
