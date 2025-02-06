/* eslint-disable */

import React, { Component } from 'react';
import Spin from './Spin.js';
import * as bodyScroll from './body-scroll.js';

class Spinner extends Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
  }

  static defaultProps = {
    loading: true,
    page: false, // DEPRECATE this
    mode: false, // page, inline
    message: null,
    options: null,
  };

  getSpinOptions() {
    if (this.props.options) return this.props.options;

    if (this.props.mode === 'inline') {
      return {
        width: 1,
        length: 2,
        radius: 4,
        color: '#666',
      };
    }

    return {
      width: 1,
      length: 6,
      radius: 10,
      color: '#666',
    };
  }

  evaluate() {
    if (this.props.page) {
      if (this.props.loading) {
        bodyScroll.disable();
      } else {
        bodyScroll.enable();
      }
    }
  }

  componentDidMount() {
    this.evaluate();
  }

  componentDidUpdate() {
    this.evaluate();
  }

  componentWillUnmount() {
    if (this.props.page) {
      bodyScroll.enable();
    }
  }

  render() {
    const classes = [
      this.props.mode === 'inline' ? 'spin-inline' : 'spin-center',
    ];

    if (this.props.loading) classes.push('spin-canvas');

    if (this.props.page || this.props.mode === 'page')
      classes.push('spin-page');

    return (
      <>
        <span className={classes.join(' ')}>
          <span
            ref={this.canvasRef}
            style={
              this.props.mode !== 'inline'
                ? {
                    position: 'absolute',
                    width: 0,
                    zIndex: 2000000000,
                    left: '50%',
                    top: '50%',
                  }
                : {}
            }
          >
            {this.props.loading ? <Spin {...this.getSpinOptions()} /> : null}
            {this.props.mode !== 'inline' && this.props.message ? (
              <span className="spin-message">{this.props.message}</span>
            ) : null}
          </span>
        </span>
        {this.props.mode === 'inline' && this.props.message ? (
          <span className="spin-message">{this.props.message}</span>
        ) : null}
      </>
    );
  }
}

export default Spinner;
