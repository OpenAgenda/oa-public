"use strict";

import _ from 'lodash';

import React, { Component } from 'react';

import ih from 'immutability-helper';
import TagsInput from 'react-tagsinput';

import Sub from '@openagenda/form-schemas/client/build/Components/Sub';
import Counter from '@openagenda/form-schemas/client/build/Components/FieldCounter';

module.exports = class KeywordsComponent extends Component {

  onChange( language, value ) {

    this.props.onChange( ih( this.props.value || {}, _.set( {}, language, {
      $set: value
    } ) ) );

  }

  renderInput( l ) {

    return <div>
      <TagsInput 
        value={preClean( this.props.value, l )} 
        onChange={this.onChange.bind(this, l)}
        inputProps={{
          placeholder: this.props.field.placeholder,
          style: !_.get( this.props.value, l ) ? { width: '630px' } : null
        }}
      />
    </div>

  }

  singleLanguageRender() {

    return <div className="keywords">
      {this.renderInput( _.first( this.props.field.languages ) )}
    </div>

  }

  render() {

    if ( this.props.field.languages.length === 1 ) {

      return this.singleLanguageRender();

    }

    return <div className="keywords">
      <ul className="list-unstyled">
        {this.props.field.languages.map( l => (
        <li key={this.props.field.field + '_' + l}>
          <div className="lang-input">
            <label>{l}</label>
            {this.renderInput( l )}
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
