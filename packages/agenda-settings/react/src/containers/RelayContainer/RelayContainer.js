import React, { Component, PropTypes } from 'react';

export default class RelayContainer extends Component {

  static displayName = 'RelayContainer';

  static propTypes = {
    component: PropTypes.element,
    routerProps: PropTypes.object,
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  static childContextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  getChildContext() {
    return {
      lang: this.props.lang,
      getLabel: label => this.props.getLabel( label, this.props.lang )
    };
  }

  render() {
    const { component: Component, routerProps } = this.props;
    return <Component {...routerProps} />;
  }

}
