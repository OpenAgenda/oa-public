"use strict";

const _ = {
  flatten: require( 'lodash/flatten' ),
  isArray: require( 'lodash/isArray' ),
  get: require( 'lodash/get' ),
  set: require( 'lodash/set' )
}

import React, { Component } from 'react';

import ih from 'immutability-helper';
import TagsInput from 'react-tagsinput';

import Sub from '@openagenda/form-schemas/client/build/lib/Sub';
import Counter from '@openagenda/form-schemas/client/build/lib/FieldCounter';

module.exports = class KeywordsComponent extends Component {

  onChange( language, value ) {

    this.props.onChange( ih( this.props.value || {}, _.set( {}, language, {
      $set: value
    } ) ) );

  }

  render() {

    return <div className="keywords">
      <ul className="list-unstyled">
        {this.props.field.languages.map( l => (
        <li key={this.props.field.field + '_' + l}>
          <div className="lang-input">
            <label>{l}</label>
            <div>
              <TagsInput 
                value={preClean( this.props.value, l )} 
                onChange={this.onChange.bind(this, l)}
                inputProps={{
                  placeholder: this.props.field.placeholder,
                  style: !_.get( this.props.value, l ) ? { width: '630px' } : null
                }}
              />
              <Counter value={_.get( this.props.value, l )} max={this.props.field.max}/>
              <Sub label={this.props.field.sub} error={_.get( this.props.error, l )}/>
            </div>
          </div>
        </li>))}
      </ul>
    </div>

  }

}

function preClean( value, lang ) {

  const lValue = _.get( value, lang, [] ) || [];

  if ( !_.isArray( lValue ) ) return [];

  return _.flatten( lValue.map( v => v.split( ',' ).map( v => v.trim() ) ) );

}