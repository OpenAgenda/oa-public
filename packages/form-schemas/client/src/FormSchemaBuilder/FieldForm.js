import React, { Component } from 'react';
import Options from './Options';

import slugFromLabel from './lib/slugFromLabel';
import fg from './lib/fieldGroups';
import merge from '../iso/merge';
import flattenLabels from '../lib/flatten';
import unflattenLabels from './lib/unflattenLabels';
import restrictLabelLanguages from './lib/restrictLabelLanguages';
import optionsValidator from './lib/optionsValidator';

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
    fg.options( { labelLanguages } ),
    fieldOrder( [ 'label', 'optional', 'options', 'placeholder', 'sub' ] )
  ),
  radio: ( { labelLanguages } ) => merge(
    fg.labels( { labelLanguages } ),
    fg.optional(),
    fg.options( { labelLanguages } ),
    fieldOrder( [ 'label', 'optional', 'options', 'placeholder', 'sub' ] )
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

  onSubmit( sanitize ) {

    const { lang, field, fieldType, labelLanguages } = this.props;

    const { values } = this.state;

    const { errors } = sanitize( values );

    if ( errors.length ) {

      return this.setState( { errors } );

    }

    if ( !values || _.get( this, 'state.errors', [] ).length ) return;

    this.props.onSubmit( _.assign( restrictLabelLanguages( values, labelLanguages ), {
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

    schema.custom = {
      options: optionsValidator
    };

    return <div className="margin-top-sm">
      <FormSchemaComponent
        stateless={true}
        values={this.state.values}
        errors={this.state.errors}
        components={{
          options: Options
        }}
        onChange={this.onChange.bind( this )}
        lang={lang}
        schema={schema}
        actionComponents={[ {
          position: 'bottom',
          Component: ( { sanitize } ) => actionComponent( {
            onSubmit: this.onSubmit.bind( this, sanitize )
          } )
        } ]}
      />
    </div>

  }

}
