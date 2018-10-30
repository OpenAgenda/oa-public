"use strict";

import _ from 'lodash';
import sa from 'superagent';
import React, { Component } from 'react';

import Spinner from '@openagenda/react-components/build/Spinner';
import Modal from '@openagenda/react-components/build/Modal';
import LocationSelector from '@openagenda/agenda-locations/components/build/LocationSelector';

module.exports = class LocationComponent extends Component {

  constructor( props ) {

    super( props );

    let location = null;

    if ( !props.value ) {

      this.state = {
        mode: 'search'
      }

      return;

    }

    this.state = {
      initing: true
    }

    this.loadLocation();

  }

  loadLocation() {

    sa.get( this.props.field.res + '?uids[]=' + _.get( this.props.value, 'uid' ) ).then( res => {

      this.setState( {
        initing: false,
        mode: res.body.items.length ? 'show' : 'search'
      } );

      this.props.onChange( _.first( res.body.items ) );

    } );

  }

  detailedRes() {

    const { res } = this.props.field;

    return {
      index: `${res}`,
      geocode: `${res}/geocode`,
      insee: `${res}/insee`,
      set: `${res}`,
      remove: `${res}/remove`
    }

  }

  onChange( caller, mode, location ) {

    this.setState( { mode } );

    this.props.onChange( location );

  }

  renderSelector() {

    const {
      lang,
      value
    } = this.props;

    return <LocationSelector
      allowCreate={true}
      mode={this.state.mode}
      disableChange={false}
      classNames={{
        input: ''
      }}
      onChangeMode={this.onChange.bind( this, 'onChangeMode' )}
      location={value}
      lang={this.props.lang}
      res={this.detailedRes()}
      onChange={( location, mode ) => this.onChange( 'onChange', mode, location )}
    />

  }

  render() {

    const spinnerCanvasStyle = {
      height: 37,
      position: 'relative'
    };

    if ( this.state.initing ) {

      return <div className="margin-v-sm text-center" style={spinnerCanvasStyle}>
        <Spinner mode="inline"/>
      </div>

    }

    if ( this.state.mode === 'create' ) {

      return <div>
        <div className="text-center" style={spinnerCanvasStyle} >
          <Spinner mode="inline"/>
        </div>
        <Modal
          classNames={{ overlay: 'popup-overlay big' }}
        >
          {this.renderSelector()}
        </Modal>
      </div>

    }

    return <div className={this.state.mode === 'show' ? 'padding-v-sm padding-h-xs' : ''}>
      {this.renderSelector()}
    </div>

  }

}
