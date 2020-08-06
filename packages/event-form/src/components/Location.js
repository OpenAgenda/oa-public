import _ from 'lodash';
import ih from 'immutability-helper';
import sa from 'superagent';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, Spinner } from '@openagenda/react-components';
import LocationSelector from '@openagenda/agenda-locations/components/build/LocationSelector';

import flattenLocationTagSet from '../utils/flattenLocationTagSet';

const getRes = (res, key, suffix) => {
  if (typeof res === 'string') {
    return res + suffix;
  } else if (res[key]) {
    return res[key];
  } else {
    return res.default + suffix
  };
}

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

    sa.get( this.props.field.res + '/' + locationUid ).then( res => {

      this.setState( {
        initing: false,
        mode: res.body ? 'show' : 'search'
      } );

      this.props.onChange( res.body );

    }, err => {

      console.log( 'could not load %s', locationUid );
      console.log( err );

      this.setState( {
        initing: false,
        mode: 'search'
      } );

    } );

  }

  detailedRes() {
    const { res } = this.props.field;

    const detailed = {
      index: getRes(res, 'index', ''),
      geocode: getRes(res, 'geocode', '/geocode'),
      reverseGeocode: getRes(res, 'reverse', '/geocode/reverse'),
      insee: getRes(res, 'insee', `/insee`),
      set: getRes(res, 'set', ''),
      remove: getRes(res, 'remove', '/remove'),
      image: {
        newUpload: getRes(res, 'newImageUpload', `/image`),
        newRemove: getRes(res, 'newImageRemove', `/image/remove`),
        upload: getRes(res, 'imageUpload', `/:locationUid/image`),
        remove: getRes(res, 'imageRemove', `/:locationUid/image/remove`)
      },
      suggestChange: getRes(res, 'suggestChange', `/:locationUid/suggest-change/conversation/create`)
    }

    return detailed;
  }

  getSettings() {

    const settings = _.get(this.props, 'field.legacy', {});

    if ( settings.tagSet ) {

      return ih( settings, {
        tagSet: { $set: flattenLocationTagSet( settings.tagSet, this.props.lang ) }
      } );

    }

    return settings;

  }

  onChange(mode, location) {
    console.log(mode, location);
    this.setState({ mode });

    if (location !== undefined) {
      this.props.onChange(location);
    }
  }

  renderSelector() {

    const {
      lang,
      value
    } = this.props;

    const {
      default: defaultValue,
      mapboxKey,
      detailedInfo,
      disableChange,
      allowCreate,
      confirmRequired
    } = this.props.field;

    return <LocationSelector
      allowCreate={allowCreate}
      confirmRequired={confirmRequired}
      mapboxKey={mapboxKey}
      mode={this.state.mode}
      disableChange={disableChange}
      detailedInfo={detailedInfo}
      classNames={{
        input: ''
      }}
      location={_.assign( {}, defaultValue || {}, value )}
      lang={lang}
      settings={this.getSettings()}
      res={this.detailedRes()}
      onChange={this.onChange.bind(this)}
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

    if (['create', 'confirm'].includes(this.state.mode)) {

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
  legacy: PropTypes.object,
  field: PropTypes.object
};

LocationComponent.defaultProps = {
  location: null,
  lang: 'en',
  legacy: {},
  field: null
};


module.exports = LocationComponent;
