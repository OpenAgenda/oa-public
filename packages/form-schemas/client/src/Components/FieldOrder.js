import _ from 'lodash';
import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from '../lib/builderLabels';

const getLabel = makeLabelGetter( labels );

export default class FieldOrder extends Component {

  onStartOrder() {

    const { onStartOrder, fields } = this.props;

    this.setState( {
      initialOrder: fields.map( f => f.field )
    } );

    this.props.onStartOrder();

  }

  onCancel() {

    this.props.onCancel( this.state.initialOrder );

  }

  renderEdit() {

    const {
      ordering,
      lang,
      onFinishOrder,
      onCancel,
      disabled
    } = this.props;

    return <div className="text-center padding-top-sm">
      <p>{getLabel( 'orderInstruction', lang )}</p>
      <button className="btn btn-link" onClick={() => onFinishOrder() }>{getLabel( 'orderSave', lang )}</button>
      <button className="btn btn-link" onClick={() => this.onCancel()}>
        <span className="text-danger">{getLabel( 'orderCancel', lang )}</span>
      </button>
    </div>

  }

  render() {

    const {
      ordering,
      lang,
      disabled
    } = this.props;

    return <div>
      <label className="padding-top-sm">{getLabel( 'orderTitle', lang)}</label>
      { !disabled && !ordering ? <button className="btn btn-link" onClick={() => this.onStartOrder()}>{getLabel( 'orderEdit', lang )}</button> : null }
      { !disabled && ordering ? this.renderEdit() : null }
    </div>

  }

}
