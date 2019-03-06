"use strict";

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import labels from '@openagenda/labels/agenda-locations/selector';
import createLabels from '@openagenda/labels/agenda-locations/create';
import LocationForm from './LocationForm';
import LocationSearch from './LocationSearch';
import CreateFormHeader from './CreateFormHeader';

module.exports = createReactClass( {

  propTypes: {

    lang: PropTypes.string,

    location: PropTypes.object,

    enableGeocode: PropTypes.bool,

    // agenda-specific settings for selector
    settings: PropTypes.object,

    /**
     * mode of the selector needs to be handled by
     * the parent component as in the event form use case,
     * the component is displayed at 2 different locations depending
     * on the mode. Create replaces the form, search is embedded in it;
     */
    mode: PropTypes.string,

    onChangeMode: PropTypes.func,

    disableChange: PropTypes.bool,

    allowCreate: PropTypes.bool,

    onChange: PropTypes.func // if location has changed, returns it;
  },

  getDefaultProps: function() {

    return {
      mode: 'create',
      enableGeocode: true,
      settings: {
        eventForm: {
          detailed: false
        }
      },
      disableChange: false,
      allowCreate: true
    };

  },

  getInitialState: function() {

    return {
      name: ''
    };

  },

  getLabel: function( name, values ) {

    const label = labels[ name ];

    let str = _.get( label, this.props.lang, label[ _.first( _.keys( label ) ) ] );

    let k;

    if ( values ) {

      for ( k in values ) {

        str = str.replace( k, values[ k ] );

      }

    }

    return str;

  },

  getMode: function() {

    return this.props.mode || 'show';

  },

  onSelect: function( l ) {

    this.props.onChange( l, 'show' );

  },

  onCreateRequest: function( value ) {

    this.props.onChangeMode( 'create', { name: value } );

  },

  onCreateSuccess: function( l ) {

    this.props.onChange( l, 'show' );

  },

  switchToSearch: function() {

    this.props.onChangeMode( 'search' );

  },

  renderSelected: function() {

    var l = this.props.location;

    return <div className="selected-location">
      { !this.props.disableChange ? <div className="actions">
        <a
          onClick={this.switchToSearch}
          className="btn btn-default">
          {this.getLabel( l ? 'change' : 'find' )}
        </a>
      </div> : null }
      { l ? <div>
        <div className="name">{l.name}</div>
        <div className="address">{l.address}</div>
      </div>
      : <div>
        <p className="nolocation">{ this.getLabel( 'nolocation' ) }</p>
      </div> }
    </div>

  },
  renderSearch: function() {

    return <LocationSearch
      init={this.props.location ? this.props.location.name : '' }
      getLabel={this.getLabel}
      res={this.props.res}
      lang={this.props.lang}
      onSelect={this.onSelect}
      allowCreate={this.props.allowCreate}
      onCreateRequest={this.onCreateRequest}/>

  },

  renderHeader() {

    return <CreateFormHeader
      settings={ this.props.settings }
      lang={ this.props.lang }
    />

  },

  renderCreateForm: function() {

    return <LocationForm
      Header={ this.renderHeader() }
      settings={this.props.settings}
      detailedInfo={this.props.settings.eventForm && this.props.settings.eventForm.detailed}
      res={this.props.res}
      enableGeocode={this.props.enableGeocode}
      lang={this.props.lang}
      onCancel={this.switchToSearch}
      onSuccess={this.onCreateSuccess}
      labels={createLabels}
      location={this.props.location} />

  },

  render: function() {

    var self = this;

    return <div className="location-selector">
      { function() {

        switch ( self.getMode() ) {
          case 'show' : return self.renderSelected();
          case 'search' : return self.renderSearch();
          case 'create' : return self.renderCreateForm();
        }

      }() }
    </div>

  }

} );
