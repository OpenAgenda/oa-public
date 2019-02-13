import _ from 'lodash';
import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import labels from './lib/builderLabels';
import Modal from '@openagenda/react-components/build/Modal';

import isEmptySchema from './lib/isEmptySchema';
import {
  getDraggableListStyle,
  getDraggableListItemStyle
} from './lib/draggableStyles';

import reorderSchemaFields from './lib/reorderSchemaFields';
import getFieldLabel from './lib/getFieldLabel';

import FieldPreview from './Components/FieldPreview';
import FieldEdit from './Components/FieldEdit';

const getLabel = makeLabelGetter( labels );

export default class FormSchemaComponent extends Component {

  constructor( props ) {

    super( props );

    const initState = {
      editedField: null,
      labels//: flattenLabels( labels, props.lang, true )
    }

    if ( props.devState ) {

      _.assign( initState, props.devState );

    }

    this.state = initState;

  }

  onDragEnd( { source, destination } ) {

    if ( !destination ) return;

    this.props.onUpdate( reorderSchemaFields(
      this.props.schema,
      source.index,
      destination.index
    ) );

  }

  onFieldEdit( field ) {

    this.setState( { editedField: field.field } );

  }

  renderEditedField() {

    const field = _.first(
      _.get(
        this.props.schema,
        'fields',
        []
      ).filter( f => f.field === this.state.editedField )
    );

    return <Modal
      title={getLabel( 'editFieldTitle', {
        name: getFieldLabel( field, 'label', this.props.lang )
      }, this.props.lang )}
      onClose={()=>{}}
    ><FieldEdit field={field} lang={this.props.lang} /></Modal>

  }

  render() {

    const { addEnabled, schema } = this.props;
    const { labels, editedField } = this.state;

    return <div className="form-schema-builder">
      <p>This is the builder</p>
      { editedField ? this.renderEditedField() : null }
      <div className="margin-bottom-sm">
        <DragDropContext
          onDragEnd={this.onDragEnd.bind( this )}>
          <Droppable droppableId="droppable">
            {( provided, snapshot ) => (
              <div
                className="field-preview-canvas"
                ref={provided.innerRef}
                style={getDraggableListStyle(snapshot.isDraggingOver)}
              >
                {_.get( schema, 'fields', [] ).map( ( field, index ) => (
                  <Draggable
                    key={field.field}
                    draggableId={field.field}
                    index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getDraggableListItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )} >
                        <FieldPreview
                          lang={this.props.lang}
                          field={field}
                          onEdit={this.onFieldEdit.bind( this, field )}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      { addEnabled ?
        <button className="btn btn-primary">{getLabel( 'addField', this.props.lang )}</button>
      : null }
    </div>

  }

}
