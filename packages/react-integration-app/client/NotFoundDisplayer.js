import { Component } from 'react';
import { matchRoutes } from 'react-router-config';

export default class NotFoundDisplayer extends Component {
  unlisten = this.props.history.listen(this.handleLocationChange);

  constructor(props) {
    super(props);

    this.state = {
      display: this.isNotFound(),
    };
  }

  componentDidMount() {
    this.handleLocationChange();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { state } = this;

    return state.display !== nextState.display;
  }

  componentWillUnmount() {
    this.unlisten();
  }

  handleLocationChange = () => {
    const display = this.isNotFound();

    if (display !== this.state.display) {
      this.setState({ display });
    }
  };

  isNotFound = () => {
    const { history, apps } = this.props;

    return Object.values(apps).every(
      app => !(
        app.routes
          && matchRoutes(app.routes, history.location.pathname).length
      )
    );
  };

  render() {
    const { children } = this.props;
    const { display } = this.state;

    return display && children ? children : null;
  }
}
