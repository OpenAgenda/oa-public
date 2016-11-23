import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import makeGetterLabel from 'labels';
import labels from 'labels/aggregator-sources';

@connect(
  state => ({
    res: state.res,
    lang: state.settings.lang
  })
)
export default class App extends Component {

  static childContextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  state = {
    menuOpen: false
  };

  getChildContext() {
    const { lang } = this.props;

    return {
      lang,
      getLabel: (label, values = {}) => makeGetterLabel( labels )( label, values, lang )
    };
  }

  render() {

    return (
      <div className="aggregator-sources">
        {this.props.children}
      </div>
    );

  }

}