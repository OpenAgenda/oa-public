import _ from 'lodash';
import ih from 'immutability-helper';
import sa from 'superagent';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, Spinner } from '@openagenda/react-shared';
import LocationSelector from '@openagenda/agenda-locations-app/dist/components/LocationSelector';
import Provider from '@openagenda/agenda-locations-app/dist/decorators/Providers';
//import Provider from '@openagenda/agenda-locations/components/build/Provider';

import flattenLocationTagSet from '../utils/flattenLocationTagSet';

const getResItem = (res, key, suffix) => {
  if (typeof res === 'string') {
    return res + suffix;
  } else if (res[key]) {
    return res[key];
  } else {
    return res.default + suffix
  };
}

const getResObject = res => ({
  index: getResItem(res, 'index', ''),
  get: getResItem(res, 'get', '/:uid'),
  geocode: getResItem(res, 'geocode', '/geocode'),
  reverseGeocode: getResItem(res, 'reverse', '/geocode/reverse'),
  insee: getResItem(res, 'insee', `/insee`),
  create: getResItem(res, 'create', ``),
  remove: getResItem(res, 'remove', '/remove'),
  suggestChange: getResItem(res, 'suggestChange', `/:locationUid/suggest-change/conversation/create`)
})

class LocationComponent extends Component {

  constructor(props) {
    super(props);

    const locationUid = _.get(props, 'value.uid') || _.get(props, 'field.default.uid');

    const res = getResObject(props.field.res);

    if (!locationUid) {
      this.state = {
        mode: 'search',
        res
      }
    } else {
      this.state = {
        initing: true,
        res
      }
      this.loadLocation(locationUid);
    }
  }

  loadLocation(locationUid) {
    sa.get(this.state.res.get.replace(':uid', locationUid)).then(res => {
      this.setState({
        initing: false,
        mode: res.body ? 'show' : 'search'
      });

      this.props.onChange(res.body);
    }, err => {
      console.log('could not load %s', locationUid);
      console.log(err);

      this.setState({
        initing: false,
        mode: 'search'
      });
    });
  }

  getSettings() {
    const settings = _.get(this.props, 'field.legacy', {});

    if (settings.tagSet) {
      return ih(settings, {
        tagSet: { $set: flattenLocationTagSet(settings.tagSet, this.props.lang) }
      });
    }

    return settings;
  }

  onChange(mode, location) {
    this.setState({ mode });

    if (location !== undefined) {
      this.props.onChange(location);
    }
  }

  renderSelector() {
    const {
      lang,
      value,
      relatedValues
    } = this.props;

    const allowRemove = relatedValues?.optional?.attendanceMode === 2;

    const {
      default: defaultValue,
      tiles,
      detailedInfo,
      disableChange,
      allowCreate,
      confirmRequired,
    } = this.props.field;

    return <Provider lang={lang}>
      <LocationSelector
        allowCreate={allowCreate}
        confirmRequired={confirmRequired}
        tiles={tiles}
        mode={this.state.mode}
        disableChange={disableChange}
        detailedInfo={detailedInfo}
        classNames={{
          input: ''
        }}
        allowRemove={allowRemove}
        onRemove={() => this.onChange('search', null)}
        location={_.assign({}, defaultValue || {}, value)}
        lang={lang}
        settings={this.getSettings()}
        res={this.state.res}
        onChange={this.onChange.bind(this)}
      />
    </Provider>
  }

  render() {
    const spinnerCanvasStyle = {
      height: 37,
      position: 'relative'
    };

    if (this.state.initing) {
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
