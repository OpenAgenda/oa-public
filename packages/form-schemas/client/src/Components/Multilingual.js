import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';

import FieldCounter from './FieldCounter';
import Sub from './Sub';

const FieldComponents = {
  text: require( './TextField' ),
  textarea: require( './TextField' ),
  html: require( './HTMLField' ),
  markdown: require( './MarkdownField' )
}

module.exports = class MultilingualField extends Component {

  onChange( language, value ) {

    this.props.onChange( ih( this.props.value || {}, _.set( {}, language, {
      $set: value
    } ) ) );

  }

  renderField( l ) {

    const { field, error, enabled } = this.props;

    const Component = _.get( this.props, 'component', FieldComponents[ field.fieldType ] );

    const languageField = ih( field, {
      default: { $set: _.get( field, [ 'default', l ], 
        _.isObject( field.default ) ? null : field.default 
      ) }
    } );

    return <div>
      <Component
        lang={this.props.lang}
        field={languageField}
        enabled={enabled}
        value={_.get( this.props.value, l )}
        onChange={this.onChange.bind( this, l )} />
      {field.max?<FieldCounter value={_.get( this.props.value, l )} max={field.max}/>:null}
      <Sub label={field.sub} error={_.get( error, l )}/>
    </div>

  }

  render() {

    const { field, error } = this.props;

    if ( field.languages.length === 1 ) {

      return this.renderField( field.languages[ 0 ] );

    }

    return <ul className="list-unstyled">
      {field.languages.map( l => (
        <li key={field.field + '_' + l}>
          <div className="lang-input">
            <label>{l}</label>
            {this.renderField( l )}
          </div>
        </li>
      ) )}
    </ul>

  }

}
