import React, { Component } from 'react';
import { render } from 'react-dom';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import FormSchemaComponent from '../';
import labels from '../lib/builderLabels';
import labelsSchema from '../lib/labelsSchema';
import merge from '../iso/merge';

const getLabel = makeLabelGetter( labels );

const textFieldSchema = {
  fields: [ {
    field: 'label',
  }, {
    field: 'optional',
    fieldType: 'boolean',
    label: labels.fieldFormOptional
  }, {
    field: 'max',
    fieldType: 'integer',
    default: 255,
    label: labels.fieldFormMaxTextLength
  }, {
    field: 'min',
    fieldType: 'integer',
    default: 0,
    label: labels.fieldFormMinTextLength
  }, {
    field: 'info'
  }, {
    field: 'placeholder'
  }, {
    field: 'sub'
  } ]
}

export default class TextFieldForm extends Component {

  constructor( props ) {

    super( props );

  }

  render() {

    const { lang, labelLanguages } = this.props;

    const schema = merge( labelsSchema( { labelLanguages } ), textFieldSchema )

    return <div>
      <FormSchemaComponent
        stateless={true}
        values={{}}
        lang={lang}
        schema={schema}
        actionComponents={[ {
          position: 'bottom',
          Component: ( { onSubmit } ) => <div className="padding-v-sm padding-h-sm">
            <div className="margin-v-sm">
              <div>Boop</div>
            </div>
          </div>
        } ]}
      />
    </div>

  }

}
