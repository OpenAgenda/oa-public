"use strict";

const React = require( 'react' );


const RelayContainer = React.createClass( {

  displayName: 'RelayContainer',

  childContextTypes: {
    lang: React.PropTypes.string,
    getLabels: React.PropTypes.func
  },

  getChildContext() {
    return {
      lang: this.props.lang,
      getLabels: label => this.props.getLabels( label, this.props.lang )
    };
  },

  render() {
    const { Component, store, routerProps } = this.props;
    return <Component store={store} {...routerProps} />;
  }

} );

module.exports = RelayContainer;