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

    if ( !this.props.value ) {

      this.state = {
        mode: 'search',
        location: null
      }

      return;

    }

    this.state = {
      initing: true
    }

    this.loadLocation();

  }

  loadLocation() {

    sa.get( this.props.field.res.index, { uids: [ this.props.value ] } ).then( res => {

      if ( !res.body.items.length ) {

        this.setState( {
          initing: false,
          location: null,
          mode: 'search'
        } );

        return;

      }

      this.setState( {
        initing: false,
        location: res.body.items[ 0 ],
        mode: 'show'
      } );

    } );

  }

  onChange( caller, mode, location ) {

    this.setState( {
      mode,
      location
    } );

    this.props.onChange( _.get( location, 'uid', null ) );

  }

  renderSelector() {

    const {
      lang
    } = this.props;

    const {
      res
    } = this.props.field;

    return <LocationSelector
      allowCreate={true}
      mode={this.state.mode}
      disableChange={false}
      onChangeMode={this.onChange.bind( this, 'onChangeMode' )}
      location={this.state.location}
      lang={this.props.lang}
      res={res}
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

    //const labels = flattenLabels( timingsLabels, lang );

    return <div className="margin-v-sm">
      {this.renderSelector()}
    </div>

  }

}