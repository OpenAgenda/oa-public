import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import labels from '../lib/builderLabels';
import slugFromLabel from '../lib/slugFromLabel';

import FormSchemaComponent from '../';

const getLabel = makeLabelGetter( labels );

export default class OptionAdd extends Component {

  constructor( props ) {

    super( props );

    this.state = { values: {}, error: null }

  }

  onChange( { values, errors } ) {

    this.setState( {
      values,
      error: errors.length ? this.getErrorLabel( _.first( errors ).code ) : null
    } );

  }

  getErrorLabel( errorCode ) {

    if ( labels[ errorCode + 'Error' ] ) {

      return getLabel( errorCode + 'Error', this.props.lang );

    }

    return errorCode;

  }

  onSubmit() {

    if ( this.state.error ) return;

    const optionLabel = this.state.values.option;

    // add option must be unique
    const newOption = {
      value: slugFromLabel( optionLabel, this.props.lang ),
      label: optionLabel
    };

    if ( this.props.current.filter( o => o.value === newOption.value ).length ) {

      this.setState( {
        error: this.getErrorLabel( 'optionDuplicate' )
      } );

    } else {

      this.props.onAdd( newOption );

      this.setState( { values: null, globalError: null } );

    }

  }

  render() {

    const { languages, lang } = this.props;

    console.log( this.state );

    return <FormSchemaComponent
      stateless={true}
      onChange={this.onChange.bind( this )}
      globalError={this.state.error}
      values={this.state.values}
      lang={this.lang}
      schema={{
        fields: [ {
          label: labels.optionAdd,
          field: 'option',
          fieldType: 'text',
          languages,
          optional: false
        } ]
      }}
      actionComponents={[ {
        position: 'bottom',
        Component: () => (
          <button className="btn btn-primary" onClick={this.onSubmit.bind( this )}>{getLabel( 'optionAddAction', lang )}</button>
        )
      } ]}
    />

  }

}
