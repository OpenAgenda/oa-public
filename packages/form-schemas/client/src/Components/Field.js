import _ from 'lodash';

import React, { Component } from 'react';
import classNames from 'classnames';

import FieldCounter from './FieldCounter';
import Help from './Help';
import Info from './Info';
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
  boolean: require( './BooleanField' ),
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

    // field is decorated with labels
    const decorated = ![ 'boolean' ].includes( field.fieldType );

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
      {decorated && field.label ? <label className={classNames({
        'control-label' : true,
        'margin-right-xs' : !field.optional || _hasHelp( field )
      })}>{field.label}</label> : null}
      {!decorated || field.optional ? '' : <span className={classNames({
        'margin-right-xs' : _hasHelp( field ),
        error: !!error
      })}>{'(' + labels.required + ')'}</span>}
      {_hasHelp( field ) ? <Help
        id={'help-' + field.field}
        label={field.help}
        lang={lang}
        link={field.helpLink}
        content={field.helpContent}
      /> : null }
      {decorated ? <Info value={field.info}/> : null}
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


function _hasHelp( field ) {
  return field.help || field.helpLink || field.helpContent
}
