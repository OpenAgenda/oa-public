import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { renderField, renderInput, renderTextarea, renderInputGroup } from '../utils/inputs';

const displayInputError = ( { dirty, touched } ) => touched && dirty;

@reduxForm( {} )
export default class CreateKeyForm extends Component {

  static contextTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string
  };

  constructor() {
    super();
    this.renderField = renderField.bind( this );
    this.renderInput = renderInput.bind( this );
    this.renderTextarea = renderTextarea.bind( this );
    this.renderInputGroup = renderInputGroup.bind( this );
  }

  /* componentWillMount() {
    this.props.initialize( { label: this.getDefautKeyName() } )
  }

  getDefautKeyName() {
    const { keys } = this.props;
    const { getLabel } = this.context;

    const nbr = keys.reduce( ( result, item ) => {
      const match = item.label.match( new RegExp( getLabel( 'keyNbr', { nbr: '(\\d)' } ), 'i' ) );
      return match && match[ 1 ] > result ? parseInt( match[ 1 ] ) + 1 : result;
    }, 1 );

    return getLabel( 'keyNbr', { nbr } );
  } */

  render() {

    const { handleSubmit } = this.props;
    const { getLabel } = this.context;

    return (
      <form onSubmit={handleSubmit}>
        <Field name="label" type="hidden" />
        <button type="submit" className="btn btn-default">{getLabel( 'generateKey' )}</button>
      </form>
    );

  }

}
