import React, { Component } from 'react';
import { withRouter, Route } from 'react-router-dom';

@withRouter
class RouterTrigger extends Component {
  static defaultProps = {
    trigger: () => {
    }
  };

  state = {
    needTrigger: false,
    location: null,
    previousLocation: null
  };

  static getDerivedStateFromProps(props, state) {
    const { location } = state;

    const {
      location: { pathname }
    } = props;

    const navigated = !location || pathname !== location.pathname;

    if (navigated) {
      return {
        needTrigger: true,
        location: props.location,
        previousLocation: location || props.location
      };
    }

    return null;
  }

  componentDidMount() {
    this.mounted = true;

    this.trigger();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    this.trigger();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.previousLocation !== this.state.previousLocation;
  }

  safeSetState(nextState, callback) {
    if (this.mounted) {
      this.setState(nextState, callback)
    }
  }

  trigger = () => {
    const { trigger, location } = this.props;
    const { needTrigger } = this.state;

    if (needTrigger) {
      this.safeSetState({ needTrigger: false }, () => {
        trigger({ pathname: location.pathname })
          .catch(err => console.log('Failure in RouterTrigger:', err))
          .then(() => {
            // clear previousLocation so the next screen renders
            this.safeSetState({ previousLocation: null });
          });
      });
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

export default RouterTrigger;
