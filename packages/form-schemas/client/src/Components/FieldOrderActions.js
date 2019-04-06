import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from '../lib/builderLabels';

const getLabel = makeLabelGetter( labels );

export default class FieldOrder extends Component {

  componentDidMount() {

    this.setState( {
      initialOrder: this.props.fields.map( f => f.field )
    } );

  }

  render() {

    const {
      ordering,
      lang,
      onFinishOrder,
      onCancel
    } = this.props;

    return <div className="padding-all-md wsq border-v-blue border-h-blue margin-bottom-md">
      <div className="text-center">
        <p>{getLabel( 'orderInstruction', lang )}</p>
        <button className="btn btn-primary margin-h-sm" onClick={() => onFinishOrder() }>
          {getLabel( 'orderSave', lang )}
        </button>
        <button className="btn btn-default margin-h-sm" onClick={() => this.props.onCancel( this.state.initialOrder )}>
          {getLabel( 'orderCancel', lang )}
        </button>
      </div>
    </div>

  }

}
