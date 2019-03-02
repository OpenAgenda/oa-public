import React, { Component } from 'react';
import TextFieldForm from './TextFieldForm';

import generateFieldName from '../lib/generateFieldName';
import unflattenLabels from '../lib/unflattenLabels';

const fieldForms = {
  text: TextFieldForm
};

export default class FieldForm extends Component {

  constructor( props ) {

    super( props );

    const { labelLanguages, field } = props;

    this.state = {
      values: unflattenLabels( field, labelLanguages ),
      errors: []
    }

  }

  onChange( { values, errors } ) {

    this.setState( { errors, values } );

  }

  onSubmit() {

    const { lang, field, fieldType } = this.props;

    const { values } = this.state;

    if ( !values || _.get( this, 'state.errors', [] ).length ) return;

    this.props.onSubmit( _.assign( values, {
      fieldType,
      field: _.get( field, 'field', generateFieldName( values.label, lang ) )
    } ) );

  }

  render() {

    const {
      labelLanguages,
      lang,
      fieldType,
      actionComponent
    } = this.props;

    const FormComponent = fieldForms[ fieldType ];

    return <FormComponent
      lang={lang}
      labelLanguages={labelLanguages}
      values={this.state.values}
      errors={this.state.errors}
      onChange={this.onChange.bind( this )}
      actionComponent={() => actionComponent( {
        onSubmit: this.onSubmit.bind( this )
      } )}
    />

  }

}
