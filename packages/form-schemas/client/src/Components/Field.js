import _ from 'lodash';

import React, { Component } from 'react';
import classNames from 'classnames';

import FieldCounter from './FieldCounter';
import Help from './Help';
import Sub from './Sub';

const flattenFieldLabels = require( '../lib/flatten' );
const isFieldEnabled = require( '../lib/isFieldEnabled' );

const FieldComponents = {
  multilingual: require( './Multilingual' ),
  text: require( './TextField' ),
  integer: require( './TextField' ),
  number: require( './TextField' ),
  textarea: require( './TextField' ),
  html: require( './HTMLField' ),
  markdown: require( './MarkdownField' ),
  slate: require( './SlateField' ),
  radio: require( './RadioField' ),
  checkbox: require( './CheckboxField' ),
  date: require( './DateField' ),
  file: require( './FileField' ),
  image: require( './ImageField' )
};

module.exports = class Field extends Component {

  render() {

    const field = flattenFieldLabels( this.props.field, this.props.lang );

    const isMultilingual = _.isArray( field.languages );

    const hasMaxCounter = field.max
      && !isMultilingual
      && ![ 'integer', 'number' ].includes( field.fieldType );

    const Component = this.getFieldComponent( isMultilingual );

    const {
      value,
      onChange,
      error,
      labels,
      lang,
      className,
      relatedValues
    } = this.props;

    const isEnabled = isFieldEnabled( field, relatedValues, this.props.disabled );

    return <div className={className + ' ' + classNames( {
      disabled : !isEnabled,
      'has-error' : !!error,
      'multilingual-input-field' : isMultilingual
    } ) } key={field.field}>
      {field.label ? <label className={classNames({
        'control-label' : true,
        'margin-right-xs' : !field.optional || field.help || field.helpLink
      })}>{field.label}</label> : null}
      {field.optional ? '' : <span className={classNames({
        'margin-right-xs' : field.help || field.helpLink,
        error: !!error
      })}>{'( ' + labels.required + ' )'}</span>}
      {field.help || field.helpLink ? <Help id={'help-' + field.field} content={field.help} lang={lang} link={field.helpLink} /> : null }
      {field.info?<div>{field.info}</div>:null}
      <Component
        enabled={isEnabled}
        lang={lang}
        field={field}
        value={value}
        error={error}
        onChange={onChange}
        relatedValues={relatedValues}
      />
      {hasMaxCounter ? <FieldCounter value={value} max={field.max}/> : null }
      { !isMultilingual ? <Sub label={field.sub} error={error}/> : null }
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
