"use strict";

const _ = {
  get: require( 'lodash/get' ),
  set: require( 'lodash/set' )
}

import ih from 'immutability-helper';
import React, { Component } from 'react';
import Select from 'react-select';

import ageLabels from '@openagenda/labels/cibul-templates/age-fields';
import flattenLabels from '@openagenda/labels/flatten';

const limits = {
  min: 0,
  max: 122
};

const defaults = {
  min: 0,
  max: 99
}

module.exports = class AgeComponent extends Component {

  getSelectOptions( minValue ) {

    const labels = flattenLabels( ageLabels, this.props.lang );
    const options = [];

    let min = minValue || limits.min;

    for ( let i=0; i<limits.max; i++ ) {

      if ( min <= i ) {
      
        options.push( {
          value: i + '',
          label: i + ' ' + ( i < 2 ? labels.year : labels.years )
        } );

      }

    }

    return options;

  }

  isEnabled() {

    const min = parseInt( _.get( this.props.value, 'min', 'NaN' ) );
    const max = parseInt( _.get( this.props.value, 'max', 'NaN' ) );

    return !isNaN( min ) || !isNaN( max );

  }

  onChange( field, choice ) {

    const clean = parseInt( choice.value );

    this.props.onChange( ih( this.props.value, _.set( {}, field, {
      $set: isNaN( clean ) ? null : clean
    } ) ) );

  }

  toggleEnabled( enable = null ) {

    const isEnabled = this.isEnabled();

    if ( enable === true ) {

      if ( !isEnabled ) this.initialize();

    } else if ( enable === false ) {

      if ( isEnabled ) this.disable();

    } else if ( isEnabled ) {

      this.disable();

    } else {

      this.initialize();

    }

  }

  disable() {

    this.props.onChange( { min: null, max: null } );

  }

  initialize() {

    this.props.onChange( defaults );

  }

  render() {

    const field = this.props.field;

    const labels = flattenLabels( ageLabels, this.props.lang );

    const min = _.get( this.props.value, 'min', '' ) + '';
    const max = _.get( this.props.value, 'max', '' ) + '';

    return (
      <div className="age">
        <input 
          type="checkbox"
          name="age" 
          checked={this.isEnabled()} 
          onChange={this.toggleEnabled.bind( this, null )} /> 
        <div className="age-inputs">
          <label className="margin-right-sm">{labels.min}</label>
          <Select
            name="minage"
            value={min}
            options={this.getSelectOptions()}
            clearable={false}
            onChange={this.onChange.bind( this, 'min' )}
            onFocus={this.toggleEnabled.bind( this, true )}
            placeholder={labels.select}
          />
          <label className="margin-h-sm" htmlFor="maxage">{labels.max}</label> 
          <Select
            name="maxage"
            value={max}
            options={this.getSelectOptions( this.props.value ? min : false )}
            clearable={false}
            onChange={this.onChange.bind( this, 'max' )}
            onFocus={this.toggleEnabled.bind( this, true )}
            placeholder={labels.select}
          />
        </div>
      </div>
    );

  }

}