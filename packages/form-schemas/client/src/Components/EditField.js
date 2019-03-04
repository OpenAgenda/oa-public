import React, { Component } from 'react';

import FieldForm from './FieldForm';

import Modal from '@openagenda/react-components/build/Modal';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import labels from '../lib/builderLabels';

const getLabel = makeLabelGetter( labels );

export default class EditField extends Component {

  onSubmit( values ) {

    this.props.onSave( values );

  }

  render() {

    const props = this.props;

    const { field, isOwnField, lang, labelLanguages } = props;

    return <Modal classNames={{ overlay: 'popup-overlay big' }} onClose={this.props.onCancel}>
      <FieldForm
        lang={lang}
        labelLanguages={labelLanguages}
        field={field}
        fieldType={isOwnField ? field.fieldType : 'labels'}
        onSubmit={this.onSubmit.bind( this )}
        actionComponent={( { onSubmit } ) => <div>
          <button className="btn btn-default" onClick={this.props.onCancel}>{getLabel( 'cancelFieldEdit', lang ) }</button>
          <button className="btn btn-primary pull-right" onClick={onSubmit}>{getLabel( 'confirmFieldUpdate', lang )}</button>
        </div>}
      />
    </Modal>

  }

}
