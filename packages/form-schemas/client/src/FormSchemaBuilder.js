import _ from 'lodash';
import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import labels from './lib/builderLabels';

import isEmptySchema from './lib/isEmptySchema';
import merge from './iso/merge';
import {
  getDraggableListStyle,
  getDraggableListItemStyle
} from './lib/draggableStyles';

import extractSchemaInfo from './lib/extractSchemaInfo';
import insertMissingAbstractFields from './lib/insertMissingAbstractFields';
import reorderSchemaFields from './lib/reorderSchemaFields';
import updateSchemaField from './lib/updateSchemaField';

import FieldPreview from './Components/FieldPreview';

const getLabel = makeLabelGetter( labels );

export default class FormSchemaComponent extends Component {

  constructor( props ) {

    super( props );

    const initState = {
      changedSinceLastSave: false,
      editedField: null,
      mergedSchema: this.generateMergedSchemas( props ),
      labels//: flattenLabels( labels, props.lang, true )
    }

    if ( props.devState ) {

      _.assign( initState, props.devState );

    }

    this.state = initState;

  }

  onDragEnd( { source, destination } ) {

    if ( !destination ) return;

    const reorderedSchema = reorderSchemaFields(
      this.state.mergedSchema,
      source.index,
      destination.index
    );

    this.props.onUpdate( insertMissingAbstractFields( this.props.schema, reorderedSchema ) );

  }

  onFieldEdit( field ) {

    this.setState( { editedField: field.field } );

  }

  onFieldEditCancel() {

    this.setState( { editedField: null } );

  }

  onFieldEditSave( updatedField ) {

    this.setState( { editedField: null } );

    const schema = insertMissingAbstractFields( this.props.schema, this.state.mergedSchema );

    this.props.onUpdate( updateSchemaField( schema, updatedField ) );

  }

  componentWillReceiveProps( props ) {

    this.setState( {
      mergedSchema: this.generateMergedSchemas( props )
    } );

  }

  generateMergedSchemas( props ) {

    return merge.apply( null, props.extendedFrom.map( e => e.schema ).concat( props.schema ) );

  }

  render() {

    const {
      addEnabled,
      extendedFrom
    } = this.props;

    const {
      labels,
      editedField,
      mergedSchema,
      changedSinceLastSave
    } = this.state;

    return <div className="form-schema-builder">
      <div className="margin-bottom-sm">
        <div className="wsq padding-v-sm padding-h-sm">
          <p>Les champs sont triables. Glissez-déposez chaque champ dans l'emplacement désiré</p>
          <button className="btn btn-primary">Enregistrer</button>
        </div>
        <DragDropContext
          onDragEnd={this.onDragEnd.bind( this )}>
          <Droppable droppableId="droppable">
            {( provided, snapshot ) => (
              <div
                className="field-preview-canvas wsq"
                ref={provided.innerRef}
                style={getDraggableListStyle(snapshot.isDraggingOver)}
              >
                {_.get( mergedSchema, 'fields', [] ).map( ( field, index ) => (
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
                          disabled={editedField && ( editedField !== field.field )}
                          editing={editedField===field.field}
                          field={field}
                          schemaInfo={extractSchemaInfo( field, extendedFrom )}
                          lang={this.props.lang}
                          onCancel={this.onFieldEditCancel.bind( this )}
                          onEdit={this.onFieldEdit.bind( this, field )}
                          onSave={field=> this.onFieldEditSave( field )}
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
