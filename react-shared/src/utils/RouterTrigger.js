import React, { Component } from 'react';
import { withRouter, Route } from 'react-router-dom';

@withRouter
class RouterTrigger extends Component {
  static defaultProps = {
    trigger: () => {}
  };

  static getDerivedStateFromProps(props, state) {
    const { location, match } = state;

    const {
      location: { pathname }
    } = props;

    const navigated = !location || pathname !== location.pathname;

    if (navigated) {
      return {
        needTrigger: true,
        location: props.location,
        match: props.match,
        previousLocation: location,
        previousMatch: match,
      };
    }

    return {
      location: props.location,
      match: props.match
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      needTrigger: false,
      location: null,
      previousLocation: null,
      previousMatch: null,
    };
  }

  componentDidMount() {
    this.mounted = true;

    this.trigger();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { previousLocation } = this.state;
    const { location } = this.props;

    return nextState.previousLocation !== previousLocation || nextProps.location !== location;
  }

  componentDidUpdate(_prevProps, _prevState) {
    this.trigger();
  }

  componentWillUnmount() {
    this.mounted = false;
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
            this.safeSetState({ previousLocation: null, previousMatch: null });
          });
      });
    }
  }

  safeSetState = (nextState, callback) => {
    if (this.mounted) this.setState(nextState, callback);
  }

  renderer = () => this.props.children;

  render() {
    const { location, match } = this.props;
    const { previousLocation, previousMatch } = this.state;

    // use a controlled <Route> to trick all descendants into
    // rendering the old location
    return (
      <Route
        location={previousLocation || location}
        computedMatch={previousMatch || match}
        render={this.renderer}
      />
    );
  }
}

export default RouterTrigger;
