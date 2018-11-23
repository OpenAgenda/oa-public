"use strict";

import _ from 'lodash';
import sa from 'superagent';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Spinner from '@openagenda/react-components/build/Spinner';
import Modal from '@openagenda/react-components/build/Modal';
import LocationSelector from '@openagenda/agenda-locations/components/build/LocationSelector';

class LocationComponent extends Component {

  constructor( props ) {

    super( props );

    let location = null;

    const locationUid = _.get( props, 'value.uid' ) || _.get( props, 'field.default.uid' );

    if ( !locationUid ) {

      this.state = {
        mode: 'search'
      }

      return;

    }

    this.state = {
      initing: true
    }

    this.loadLocation( locationUid );

  }

  loadLocation( locationUid ) {

    sa.get( this.props.field.res + '?uids[]=' + locationUid ).then( res => {

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
      allowCreate={_.get( this.props, 'field.allowCreate' )}
      mode={this.state.mode}
      disableChange={_.get( this.props, 'field.disableChange' )}
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


LocationComponent.propTypes = {
  value: PropTypes.object, // the location
  lang: PropTypes.string,
  disableChange: PropTypes.bool,
  allowCreate: PropTypes.bool
};

LocationComponent.defaultProps = {
  location: null,
  lang: 'en',
  disableChange: false,
  allowCreate: true
};


module.exports = LocationComponent;
