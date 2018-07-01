"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';

import FieldCounter from './FieldCounter';
import Sub from './Sub';

const FieldComponents = {
  text: require( './TextField' ),
  textarea: require( './TextField' )
}

module.exports = class MultilingualField extends Component {

  onChange( language, value ) {

    this.props.onChange( ih( this.props.value || {}, _.set( {}, language, {
      $set: value
    } ) ) );

  }

  render() {

    const field = this.props.field;
    const error = this.props.error;
    
    const Component = FieldComponents[ field.fieldType ];

    return <ul className="list-unstyled">
      {field.languages.map( l => (
        <li key={field.field + '_' + l}>
          <div className="lang-input">
            <label>{l}</label>
            <div>
              <Component
                field={field}
                value={_.get( this.props.value, l )}
                onChange={this.onChange.bind( this, l )} />
              {field.max?<FieldCounter value={_.get( this.props.value, l )} max={field.max}/>:null}
              <Sub label={field.sub} error={_.get( error, l )}/>
            </div>
          </div>
        </li>
      ) )}
    </ul>

  }

}