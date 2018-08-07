"use strict";

import ih from 'immutability-helper';
import React, { Component } from 'react';

import { connect } from 'react-redux';

import Canvas from './Canvas';
import reducers from '../reducers';

import Spinner from '@openagenda/react-components/build/Spinner';


class Landing extends Component {

  componentDidMount() {

    this.props.onDisplay();

  }

  render() {

    const { lang } = this.props.config;

    return <div className="text-center margin-top-lg" style={{
      minHeight: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Spinner mode="inline" options={{
        scale: 1,
        width: 1
      }}></Spinner>
    </div>

  }

}


// container bit
export default connect(
  state => state,
  dispatch => ( {
    onDisplay: () => dispatch( reducers.landing.evaluate() )
  } )
)( Landing );