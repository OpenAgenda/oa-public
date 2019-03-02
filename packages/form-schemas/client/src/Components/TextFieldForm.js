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

export default ( {
  lang,
  labelLanguages,
  actionComponent,
  onChange,
  values,
  errors
} ) => {

  const schema = merge( labelsSchema( { labelLanguages } ), textFieldSchema )

  return <FormSchemaComponent
    stateless={true}
    values={values}
    errors={errors}
    onChange={onChange}
    lang={lang}
    schema={schema}
    actionComponents={[ {
      position: 'bottom',
      Component: actionComponent
    } ]}
  />
}
