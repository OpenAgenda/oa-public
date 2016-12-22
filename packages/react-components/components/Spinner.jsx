"use strict";

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import bodyScroll from './body-scroll';
import spin from 'spin.js';

const Spinner = props => ( <SpinnerComponent {...props} />);

export default Spinner;

Spinner.propTypes = {
  loading: React.PropTypes.bool,
  page: React.PropTypes.bool,
  message: React.PropTypes.string,
  options: React.PropTypes.object // spin.js options
}

const SpinnerComponent = React.createClass( {

  getDefaultProps() {

    return {
      loading: true,
      page: false,
      message: null,
      options: {
        width: 1,
        length: 6,
        radius: 10,
        color: '#666'
      }
    }

  },

  componentDidMount() {

    this.spinner = new spin( this.props.options );

    this.evaluate();

  },

  componentDidUpdate() {

    this.evaluate();

  },

  componentWillUnmount() {

    if ( this.props.page ) bodyScroll.enable();

  },

  evaluate() {

    if ( this.props.loading ) {

      this.spinner.spin( ReactDOM.findDOMNode( this.refs.canvas ) );

      if ( this.props.page ) bodyScroll.disable();

    } else {

      this.spinner.stop();

      if ( this.props.page ) bodyScroll.enable();

    }

  },

  render() {

    let classes = [];

    if ( this.props.loading ) classes.push( 'spin-canvas' );

    if ( this.props.page ) classes.push( 'spin-page' );

    return <div className={classes.join( ' ' )}>
      <div ref="canvas" style={{
        position: 'absolute',
        width: 0,
        zIndex: 2000000000,
        left: '50%',
        top: '50%'
      }}>
      { this.props.message ? <span className="spin-message">{this.props.message}</span> : null }
      </div>
    </div>

  }

} );