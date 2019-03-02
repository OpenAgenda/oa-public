import React, { Component } from 'react';
import Modal from '@openagenda/react-components/build/Modal';
import FormSchemaComponent from '../';
import labels from '../lib/builderLabels';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import ChooseFieldType from './ChooseFieldType';

import FieldForm from './FieldForm';

const getLabel = makeLabelGetter( labels );

export default class AddField extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      adding: false,
      fieldType: null
    };

  }

  close() {

    this.setState( { adding: false, values: null } );

  }

  onSubmit( values ) {

    this.props.onAdd( values );

    this.close();

  }

  onShowChooseTypeMenu() {

    this.setState( { adding: true, fieldType: null } );

  }

  onChooseType( chosenType ) {

    this.setState( { adding: true, fieldType: chosenType } );

  }

  renderFieldForm() {

    const { lang, labelLanguages } = this.props;

    return <FieldForm
      fieldType={_.get( this, 'state.fieldType', null )}
      onSubmit={this.onSubmit.bind( this )}
      lang={lang}
      labelLanguages={labelLanguages}
      actionComponent={( { onSubmit } ) => <div>
        <button className="btn btn-default" onClick={this.close.bind( this )}>{getLabel( 'cancelFieldEdit', lang ) }</button>
        <button className="btn btn-primary pull-right" onClick={onSubmit}>{getLabel( 'confirmFieldCreate', lang )}</button>
      </div>} />

  }

  render() {

    const { lang } = this.props;

    if ( !this.state.adding ) {

      return <button className="btn btn-primary pull-right" onClick={this.onShowChooseTypeMenu.bind( this )}>{getLabel( 'addField', lang )}</button>

    }

    return <Modal classNames={{ overlay: 'popup-overlay big' }} onClose={this.close.bind( this )}>

      <h3 className="margin-bottom-md">{getLabel( 'addField', lang )}</h3>

      { _.get( this, 'state.fieldType', null ) ?
        this.renderFieldForm()
        : <ChooseFieldType lang={lang} onChooseType={this.onChooseType.bind( this )} onCancel={this.close.bind( this )}/>  }

    </Modal>

  }

}
