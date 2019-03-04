import React, { Component } from 'react';

import slugFromLabel from '../lib/slugFromLabel';
import fg from '../lib/fieldGroups';
import merge from '../iso/merge';
import flattenLabels from '../lib/flatten';
import unflattenLabels from '../lib/unflattenLabels';

import FormSchemaComponent from '../';

const fieldOrder = order => ( { fields: order.map( f => ( { field: f, fieldType: 'abstract' } ) ) } );

const schemas= {
  labels: ( { labelLanguages } ) => fg.labels( { labelLanguages } ),
  text: ( { labelLanguages } ) => merge(
    fg.labels( { labelLanguages } ),
    fg.minMax( { min: 0, max: 255 } ),
    fg.optional(),
    fieldOrder( [ 'label', 'optional', 'min', 'max', 'info', 'placeholder', 'sub' ] )
  ),
  checkbox: ( { labelLanguages } ) => merge(
    fg.labels( { labelLanguages } ),
    fg.optional(),
    fg.options()
  )
}

export default class FieldForm extends Component {

  constructor( props ) {

    super( props );

    const { labelLanguages, field, lang } = props;

    this.state = {
      values: labelLanguages.length ? unflattenLabels( field, labelLanguages ) : flattenLabels( field, lang ),
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
      field: _.get( field, 'field', slugFromLabel( values.label, lang ) )
    } ) );

  }

  render() {

    const {
      labelLanguages,
      lang,
      fieldType,
      actionComponent
    } = this.props;

    const schema = schemas[ fieldType ]( { labelLanguages } );

    return <FormSchemaComponent
      stateless={true}
      values={this.state.values}
      errors={this.state.errors}
      onChange={this.onChange.bind( this )}
      lang={lang}
      schema={schema}
      actionComponents={[ {
        position: 'bottom',
        Component: () => actionComponent( {
          onSubmit: this.onSubmit.bind( this )
        } )
      } ]}
    />

  }

}
