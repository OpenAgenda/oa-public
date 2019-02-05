import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Route } from 'react-router';
// import NProgress from 'nprogress';

@withRouter
class RouterRedialTrigger extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    history: PropTypes.objectOf( PropTypes.any ).isRequired,
    location: PropTypes.objectOf( PropTypes.any ).isRequired
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
    const { trigger } = this.props;
    const { needTrigger } = this.state;

    if ( needTrigger ) {
      this.setState( { needTrigger: false }, () => {
        trigger()
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
