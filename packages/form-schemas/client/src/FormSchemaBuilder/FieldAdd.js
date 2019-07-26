import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import Modal from '@openagenda/react-components/build/Modal';
import React, { Component } from 'react';

import ChooseFieldType from './ChooseFieldType';
import FieldForm from './FieldForm';
import FormSchemaComponent from '../';
import labels from './lib/labels';

const getLabel = makeLabelGetter( labels );

export default class FieldAdd extends Component {

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

    const { lang, disabled } = this.props;

    if ( disabled ) {

      return <button disabled className="btn btn-primary">{getLabel( 'addField', lang )}</button>

    }

    if ( !this.state.adding ) {

      return <div className="text-center">
        <button className="btn btn-primary" onClick={this.onShowChooseTypeMenu.bind( this )}>{getLabel( 'addField', lang )}</button>
      </div>

    }

    return <Modal classNames={{ overlay: 'popup-overlay big' }} onClose={this.close.bind( this )}>

      <h3 className="margin-bottom-md">{getLabel( 'addField', lang )}</h3>

      { _.get( this, 'state.fieldType', null ) ?
        this.renderFieldForm()
        : <ChooseFieldType lang={lang} onChooseType={this.onChooseType.bind( this )} onCancel={this.close.bind( this )}/>  }

    </Modal>

  }

}
