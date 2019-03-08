import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import labels from '../lib/builderLabels';
import slugFromLabel from '../lib/slugFromLabel';

import FormSchemaComponent from '../';

const getLabel = makeLabelGetter( labels );

export default class OptionAdd extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      option: this.isEdit() ? {
        label: props.option.label
      } : {},
      error: null
    }

  }

  onChange( { values, errors } ) {

    this.setState( {
      option: values,
      error: errors.length ? this.getErrorLabel( _.first( errors ).code ) : null
    } );

  }

  getErrorLabel( errorCode ) {

    const { lang } = this.props;

    if ( labels[ errorCode + 'Error' ] ) {

      return getLabel( errorCode + 'Error', lang );

    }

    return errorCode;

  }

  onSubmit() {

    if ( this.state.error ) return;

    const optionLabel = _.get( this, 'state.option.label' );

    const isEmpty = !optionLabel || (
      _.isString( optionLabel ) ? !optionLabel.length
      : _.keys( optionLabel ).filter( k => _.isString( optionLabel[ k ] ) && optionLabel[ k ].length ).length !== _.keys( optionLabel ).length
    );

    // add option must be unique
    const option = isEmpty ? null : {
      value: slugFromLabel( optionLabel, this.props.lang ),
      label: optionLabel
    };

    if ( isEmpty ) {

      this.setState( {
        error: this.getErrorLabel( 'optionEmpty' )
      } );

    } else if ( this.props.otherOptions.filter( o => o.value === option.value ).length ) {

      this.setState( {
        error: this.getErrorLabel( 'optionDuplicate' )
      } );

    } else {

      this.props.onSubmit( option );

      this.setState( {
        option: null,
        error: null
      } );

      this.focusOnFirstInput()

    }

  }

  isEdit() {

    return !!this.props.option;

  }

  focusOnFirstInput() {

    try {

      document.querySelector( '.js_add_option_input input' ).focus();

    } catch ( e ) {

      console.log( e );

    }

  }

  render() {

    const { languages, lang, onCancel } = this.props;

    return <FormSchemaComponent
      stateless={true}
      onChange={this.onChange.bind( this )}
      globalError={this.state.error}
      values={this.state.option}
      lang={this.lang}
      schema={{
        fields: [ {
          label: this.isEdit() ? labels.optionEdit : labels.optionAdd,
          field: 'label',
          fieldType: 'text',
          languages
        } ]
      }}
      classNames={{
        field: 'js_add_option_input',
        bottomErrorsCanvas: 'error margin-bottom-sm'
      }}
      actionComponents={[ {
        position: 'bottom',
        Component: () => ( <div>
            <button className="btn btn-primary" onClick={this.onSubmit.bind( this )}>{getLabel( this.isEdit() ? 'optionUpdateAction' : 'optionAddAction', lang )}</button>
            { onCancel ? <button className="btn btn-default pull-right" onClick={this.props.onCancel}>{getLabel( 'optionEditCancel', lang )}</button> : null }
          </div>
        )
      } ]}
    />

  }

}
