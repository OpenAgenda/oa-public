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

    const { field, value, error } = this.props;

    const preCleaned = preClean( value, l );

    return <div>
      <TagsInput 
        value={preCleaned} 
        onChange={this.onChange.bind(this, l)}
        inputProps={{
          placeholder: field.placeholder,
          style: !_.get( value, l ) ? { width: '630px' } : null
        }}
      />
      <Counter value={ _.isArray( preCleaned ) ? preCleaned.join(',') : preCleaned } max={field.max} />
      <Sub label={field.sub} error={error}/>
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
