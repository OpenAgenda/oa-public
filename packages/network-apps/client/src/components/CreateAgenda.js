import React, { Component } from 'react';

import Modal from '@openagenda/react-components/build/Modal';
import FormSchemaComponent from '@openagenda/form-schemas/client/build';

export default props => <Modal onClose={props.onClose}>
  <FormSchemaComponent
    schema={{
      fields: [ {
        field: 'title',
        fieldType: 'text',
        max: 255,
        label: 'Titre',
        optional: false
      }, {
        field: 'description',
        fieldType: 'text',
        max: 140,
        label: 'Description',
        optional: false
      }, {
        field: 'official',
        fieldType: 'boolean',
        default: false,
        label: 'Officiel'
      } ]
    }}
    onSubmit={( { values } ) => props.onCreate( values ) }
  />
</Modal>
