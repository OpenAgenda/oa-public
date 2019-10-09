import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Context from './contexts/header';
import MainHeader from './MainHeader';

export default class Header extends Component {
  static contextType = Context;

  getHeaderComponent = () => {
    const store = this.props.store || this.context;
    const type = store.getState().header.type;

    switch ( type ) {
      case 'main': // fallthrough
      default:
        return MainHeader;
    }
  };

  render() {
    const { history } = this.props;
    const store = this.props.store || this.context;
    const HeaderComponent = this.getHeaderComponent();

    return (
      <Provider store={store}>
        <HeaderComponent history={history} />
      </Provider>
    );
  }
}
