import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Route } from 'react-router';

@withRouter
class RouterTrigger extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    history: PropTypes.objectOf( PropTypes.any ).isRequired,
    location: PropTypes.objectOf( PropTypes.any ).isRequired,
    trigger: PropTypes.func.isRequired
  };

  static defaultProps = {
    trigger: () => {}
  };

  state = {
    needTrigger: false,
    location: null,
    previousLocation: null
  };

  static getDerivedStateFromProps( props, state ) {
    const { location } = state;

    const {
      location: { pathname, search }
    } = props;

    const navigated = !location || `${pathname}${search}` !== `${location.pathname}${location.search}`;

    if ( navigated ) {
      return {
        needTrigger: true,
        location: props.location,
        previousLocation: location || props.location
      };
    }

    return null;
  }

  trigger = () => {
    const { trigger, location } = this.props;
    const { needTrigger } = this.state;

    if ( needTrigger ) {
      this.setState( { needTrigger: false }, () => {
        trigger( location.pathname )
          .catch( err => console.log( 'Failure in RouterTrigger:', err ) )
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

  shouldComponentUpdate( nextProps, nextState ) {
    return nextState.previousLocation !== this.state.previousLocation;
  }

  render() {
    const { children, location } = this.props;
    const { previousLocation } = this.state;

    // use a controlled <Route> to trick all descendants into
    // rendering the old location
    return <Route location={previousLocation || location} render={() => children} />;
  }
}

export default RouterTrigger;
