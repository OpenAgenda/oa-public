import _ from 'lodash';
import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import Modal from '@openagenda/react-components/build/Modal';

import FormSchemaComponent from '../';
import labels from './lib/labels';

const getLabel = makeLabelGetter( labels );

const fieldTypeChoices = [ {
  id: 1,
  value: 'text',
  label: labels.textFieldType
}, {
  id: 2,
  value: 'radio',
  label: labels.radioFieldType
}, {
  id: 3,
  value: 'checkbox',
  label: labels.checkboxFieldType
} ];

export default class ChooseFieldType extends Component {

  onFieldTypeChange( { values } ) {

    this.setState( values );

  }

  onFieldTypeSelect() {

    const fieldType = _.get( this, 'state.fieldType', 1 );

    this.props.onChooseType( _.get( _.find(
      fieldTypeChoices,
      choice => choice.id === fieldType
    ), 'value', null ) );

  }

  render() {

    const { lang } = this.props;

    return <FormSchemaComponent
        stateless={true}
        values={{ fieldType: _.get( this, 'state.fieldType', 1 ) }}
        onChange={this.onFieldTypeChange.bind( this )}
        schema={{ fields:[ {
          field: 'fieldType',
          fieldType: 'radio',
          label: getLabel( 'chooseFieldType', lang ),
          default: 1,
          options: fieldTypeChoices
        } ]}}
        actionComponents={[ {
          position: 'bottom',
          Component: ( { onSubmit } ) => <div>
            <button onClick={this.props.onCancel} className="btn btn-default">{getLabel( 'cancelFieldEdit', lang )}</button>
            <button onClick={this.onFieldTypeSelect.bind( this )} className="btn btn-primary pull-right">{getLabel( 'confirmFieldType', lang )}</button>
          </div>
        } ]}
      />

  }

}
