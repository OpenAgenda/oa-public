import ih from 'immutability-helper';

import React, { Component } from 'react';

import SlateField from './SlateField';

import HTMLSerializer from './HTMLSerializer';

module.exports = class HTMLField extends Component {

  onChange( value ) {

    this.props.onChange( HTMLSerializer.serialize( value ) );

  }

  shouldComponentUpdate( nextProps, nextState ) {

    return this.props.value !== nextProps.value;

  }

  render() {

    return <SlateField {...ih( this.props, {
      value: {
        $set: HTMLSerializer.deserialize( this.props.value )
      },
      onChange: {
        $set: this.onChange.bind( this )
      },
      raw: {
        $set: true
      }
    } ) }/>

  }

}
