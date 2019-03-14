import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import bodyScroll from './body-scroll';
import spin from 'spin.js';

const Spinner = props => ( <SpinnerComponent {...props} />);

export default Spinner;

Spinner.propTypes = {
  loading: PropTypes.bool,
  page: PropTypes.bool,
  message: PropTypes.string,
  options: PropTypes.object // spin.js options
}

const SpinnerComponent = createReactClass( {

  getInitialState() {

    this.canvasRef = React.createRef();

    return {}

  },

  getDefaultProps() {

    return {
      loading: true,
      page: false, // DEPRECATE this
      mode: false, // page, inline
      message: null,
      options: null
    }

  },

  componentDidMount() {

    this.spinner = new spin( this.getSpinOptions() );

    this.evaluate();

  },

  componentDidUpdate() {

    this.evaluate();

  },

  getSpinOptions() {

    if ( this.props.options ) return this.props.options;

    if ( this.props.mode === 'inline' ) {

      return {
        width: 1,
        length: 2,
        radius: 4,
        color: '#666'
      }

    }

    return {
      width: 1,
      length: 6,
      radius: 10,
      color: '#666'
    }

  },

  componentWillUnmount() {

    if ( this.props.page ) bodyScroll.enable();

  },

  evaluate() {

    if ( this.props.loading ) {

      this.spinner.spin( this.canvasRef.current );

      if ( this.props.page ) bodyScroll.disable();

    } else {

      this.spinner.stop();

      if ( this.props.page ) bodyScroll.enable();

    }

  },

  render() {

    let classes = [
      this.props.mode === 'inline' ? 'spin-inline' : 'spin-center'
    ];

    if ( this.props.loading ) classes.push( 'spin-canvas' );

    if ( this.props.page || this.props.mode === 'page' ) classes.push( 'spin-page' );

    return <span className={classes.join( ' ' )}>
      <span ref={this.canvasRef} style={ this.props.mode !== 'inline' ? {
        position: 'absolute',
        width: 0,
        zIndex: 2000000000,
        left: '50%',
        top: '50%'
      } : {} }>
        { this.props.message ? <span className="spin-message">{this.props.message}</span> : null }
      </span>
    </span>

  }

} );
