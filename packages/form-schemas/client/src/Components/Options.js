import _ from 'lodash';
import classNames from 'classnames';
import ih from 'immutability-helper';
import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import getPreferredLang from '../lib/getPreferredLang';
import labels from '../lib/builderLabels';
import OptionLabelsForm from './OptionLabelsForm';
import OptionItem from './OptionItem';

const getLabel = makeLabelGetter( labels );

const modes = {
  ADDING: 0,
  EDITING: 1,
  ORDERING: 2
}

export default class OptionsField extends Component {

  constructor( props ) {

    super( props );

    const state = {
      mode: null,
      editedIndex: null
    }

    if ( props.field.devInitState ) _.assign( state, props.field.devInitState );

    this.state = state;

  }

  setMode( newMode ) {

    this.setState( { mode: newMode } );

  }

  addOption( newOption ) {

    this.props.onChange( ( this.getOptions() ).concat( newOption ) );

  }

  editOption( index ) {

    this.setState( { mode: modes.EDITING, editedIndex: index } );

  }

  removeOption( index ) {

    this.props.onChange( ih( this.getOptions(), { $splice: [ [ index, 1 ] ] } ) );

  }

  updateOption( index, option ) {

    const options = this.getOptions();

    const optionWithId = _.assign( { id: options[ index ].id }, option );

    this.props.onChange( _.set( options, index, optionWithId ) );

    this.setState( { mode: null } );

  }

  onDragEnd( { source, destination } ) {

    if ( !destination ) return;

    const options = this.getOptions();
    const forward = source.index < destination.index;

    this.props.onChange( ih( options, {
      $splice: [
        [ destination.index + ( forward ? 1 : 0 ), 0, options[ source.index ] ],
        [ source.index + ( forward ? 0 : 1 ), 1 ]
      ]
    } ) );

  }

  renderOrder() {

    const { lang } = this.props;

    if ( this.state.mode !== modes.ORDERING ) {

      return <button
        onClick={this.setMode.bind( this, modes.ORDERING )}
        className="btn btn-primary order-action margin-bottom-sm"
        disabled={this.isOrderingDisabled()}>{getLabel( 'optionOrder', lang )}</button>

    }

    return <div className="text-center">
      <p className="margin-top-md">{getLabel( 'orderInstruction', lang )}</p>
      <button
        onClick={()=>{this.setMode( null )}}
        className="btn btn-primary margin-top-sm">{getLabel( 'optionOrderEndAction', lang )}</button>
    </div>

  }

  isOrderingDisabled() {

    if ( this.state.mode === modes.EDITING ) return true;

    if ( this.getOptions().length < 2 ) return true

  }

  renderAdd() {

    const { field, lang } = this.props;

    const { mode } = this.state;

    if ( ![ modes.ADDING, modes.ORDERING ].includes( mode ) ) {

      return <button
        disabled={this.state.mode !== null}
        className="btn btn-primary margin-top-md"
        onClick={this.setMode.bind( this, modes.ADDING )}>{getLabel( 'optionAdd', lang )}</button>

    }

    if ( mode === modes.ADDING ) {

      return <div className="margin-top-md">
        <OptionLabelsForm
          otherOptions={this.getOptions()}
          onSubmit={this.addOption.bind( this )}
          lang={lang}
          languages={field.languages}
        />
      </div>

    }

  }

  isOptionDisabled( index ) {

    if ( this.state.mode === modes.ADDING ) return false;

    if ( ( this.state.mode === modes.EDITING ) && ( index !== this.state.editedIndex ) ) return true;

    return false

  }

  isOptionActionable() {

    return ![ modes.EDITING, modes.ORDERING ].includes( this.state.mode );

  }

  getOptions() {

    return this.props.value || [];

  }

  renderDraggableOptions() {

    const { field, value, lang } = this.props;
    const { mode } = this.state;

    return <DragDropContext
      onDragEnd={this.onDragEnd.bind( this )}>
      <Droppable droppableId="droppable-options">
        {( provided, snapshot ) => (
          <ul
            ref={provided.innerRef}
            style={snapshot.isDraggingOver ? { background: '#f9f9f9' } : {} }
            className="list-group margin-v-sm">
            { this.getOptions().map( ( option, index ) => (
              <Draggable
                index={index}
                isDragDisabled={mode !== modes.ORDERING}
                draggableId={option.value}
                key={option.value}>
                {(provided, snapshot) => (
                  <OptionItem
                    lang={lang}
                    field={field}
                    option={option}
                    otherOptions={value.filter( ( o, i ) => i !== index )}
                    index={index}
                    isEdited={( this.state.mode === modes.EDITING ) && ( index === this.state.editedIndex )}
                    actionable={this.isOptionActionable()}
                    disabled={this.isOptionDisabled( index )}
                    onEdit={this.editOption.bind( this, index )}
                    onEditCancel={() => this.setState( { mode: null } )}
                    onRemove={this.removeOption.bind( this, index )}
                    onUpdate={this.updateOption.bind( this, index )}
                    provided={provided}
                    snapshot={snapshot} />
                )}</Draggable> ) ) }
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>

  }

  render() {

    const { field, error, value, lang } = this.props;

    const languages = field.languages;

    return <div className="options-field-form">
      {this.getOptions().length ? this.renderDraggableOptions() : <div className="margin-top-md margin-bottom-sm text-center">{getLabel( 'emptyOptions', lang )}</div> }
      {this.renderAdd()}
      {this.renderOrder()}
    </div>

  }

}
