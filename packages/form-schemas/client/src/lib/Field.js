"use strict";

import _ from 'lodash';

import React, { Component } from 'react';
import classNames from 'classnames';

import FieldCounter from './FieldCounter';

const flattenFieldLabels = require( './helpers' ).flatten;

const FieldComponents = {
  multilingual: require( './Multilingual' ),
  text: require( './TextField' ),
  textarea: require( './TextField' ),
  radio: require( './RadioField' ),
  checkbox: require( './CheckboxField' )
}

module.exports = class Field extends Component {

  render() {

    const field = flattenFieldLabels( this.props.field, this.props.lang );

    const isMultilingual = _.isArray( field.languages ) && field.languages.length > 1;

    const Component = this.getFieldComponent( isMultilingual );

    const {
      value,
      onChange,
      error,
      labels,
      lang
    } = this.props;

    return <div className={classNames( {
      'form-group' : true, 
      'has-error' : !!error,
      'multilingual-input-field' : isMultilingual
    } ) } key={field.field}>
      {field.label ? <label className="control-label">{field.label}</label> : null}
      {field.optional ? '' : <span className={classNames({
        'margin-left-xs' : true,
        error: !!error
      })}>{'( ' + labels.required + ' )'}</span>}
      {field.info?<div>{field.info}</div>:null}
      <Component
        lang={lang}
        field={field}
        value={value}
        error={error}
        onChange={onChange}
      />
      {field.max&&!isMultilingual?<FieldCounter value={value} max={field.max}/>:null}
    </div>

  }


  getFieldComponent( isMultilingual ) {

    const CustomComponent = _.get( this.props.customComponents, this.props.field.fieldType );

    if ( CustomComponent ) return CustomComponent;

    if ( isMultilingual ) return FieldComponents.multilingual;

    const StandardComponent = _.get( FieldComponents, this.props.field.fieldType );

    if ( !StandardComponent ) throw new Error( 'Field type has no associated component: ' + _.get( this.props, 'field.fieldType' ) );

    return StandardComponent;

  }

}
