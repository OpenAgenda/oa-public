import _ from 'lodash';
import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import { Modal } from '@openagenda/react-components';

import FormSchemaComponent from '../';
import labels from './lib/labels';

const getLabel = makeLabelGetter( labels );

const fieldTypeChoices = [ {
  id: 1,
  value: 'text',
  label: labels.textFieldType
}, {
  id: 4,
  value: 'textarea',
  label: labels.textareaFieldType
}, {
  id: 5,
  value: 'markdown',
  label: labels.markdownFieldType,
  info: labels.markdownFieldTypeInfo
}, {
  id: 6,
  value: 'integer',
  label: labels.integerFieldType
}, {
  id: 10,
  value: 'link',
  label: labels.linkFieldType
}, {
  id: 9,
  value: 'email',
  label: labels.emailFieldType
}, {
  id: 7,
  value: 'boolean',
  label: labels.booleanFieldType,
  info: labels.booleanFieldTypeInfo
}, {
  id: 3,
  value: 'checkbox',
  label: labels.checkboxFieldType,
  info: labels.checkboxFieldTypeInfo
}, {
  id: 12,
  value: 'multiselect',
  label: labels.multiselectFieldType,
  info: labels.multiselectFieldTypeInfo
}, {
  id: 2,
  value: 'radio',
  label: labels.radioFieldType,
  info: labels.radioFieldTypeInfo
}, {
  id: 11,
  value: 'select',
  label: labels.selectFieldType,
  info: labels.selectFieldTypeInfo
}, {
  id: 13,
  value: 'date',
  label: labels.dateFieldType,
  info: labels.dateFieldTypeInfo
}];

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
          optional: false,
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
