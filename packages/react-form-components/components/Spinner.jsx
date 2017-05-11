"use strict";

var React = require( 'react' ),

createReactClass = require( 'create-react-class' ),

PropTypes = require( 'prop-types' ),

ReactDom = require( 'react-dom' ),

Spinner = require( 'spin.js' );

module.exports = createReactClass( {

  displayName: 'Spinner',

  propTypes: {
    loading: PropTypes.bool
  },

  getDefaultProps() {

    return {
      loading: true
    }

  },

  componentDidMount: function() {

    this.spinner = new Spinner( this.props.spinner || {
      width: 1,
      length: 6,
      radius: 10,
      color: '#666'
    } );

    this.evaluate();

  },

  componentDidUpdate: function() {

    this.evaluate();

  },

  evaluate: function() {

    if ( this.props.loading ) {

      this.spinner.spin( ReactDom.findDOMNode( this.canvas ) );

    } else {

      this.spinner.stop();

    }

  },

  render: function() {

    return <div className={this.props.loading?'spin-canvas':''} ref={r => this.canvas = r}></div>;

  }

});