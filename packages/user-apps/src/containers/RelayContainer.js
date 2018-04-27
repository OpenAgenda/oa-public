"use strict";

const React = require( 'react' ),

createReactClass = require( 'create-react-class' ),

PropTypes = require( 'prop-types' );


const RelayContainer = createReactClass( {

  displayName: 'RelayContainer',

  childContextTypes: {
    lang: PropTypes.string,
    getLabels: PropTypes.func
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