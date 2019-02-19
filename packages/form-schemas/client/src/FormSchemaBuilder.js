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
import saveStates from './lib/saveStates';
import updateSchemaField from './lib/updateSchemaField';
import extractSchemaLabelLanguages from './lib/extractSchemaLabelLanguages';
import submit from './lib/submit';

import FieldPreview from './Components/FieldPreview';
import LabelLanguages from './Components/LabelLanguages';
import SaveButton from './Components/SaveButton';

const getLabel = makeLabelGetter( labels );

export default class FormSchemaComponent extends Component {

  constructor( props ) {

    super( props );

    const mergedSchema = this.generateMergedSchemas( props.schema, props.extendedFrom );

    const initState = {
      schema: props.schema,
      labelLanguages: extractSchemaLabelLanguages( mergedSchema ),
      saveState: saveStates.UNCHANGED,
      editedField: null,
      mergedSchema,
      labels
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

    this.updateSchema( insertMissingAbstractFields( this.state.schema, reorderedSchema ) );

  }

  updateSchema( schema ) {

    this.setState( {
      schema,
      mergedSchema: this.generateMergedSchemas( schema, this.props.extendedFrom ),
      saveState: saveStates.CHANGED
    } );

    this.props.onUpdate( schema );

  }

  onSave() {

    this.setState( { saveState: saveStates.LOADING } );

    submit( { values: this.state.schema } ).then( () => {

      this.setState( { saveState: saveStates.SAVED } );

    }, err => {

      console.error( error );

      this.setState( { saveState: saveStates.ERROR } );

    } );

  }

  onFieldEdit( field ) {

    this.setState( { editedField: field.field } );

  }

  onFieldEditCancel() {

    this.setState( { editedField: null } );

  }

  onFieldEditSave( updatedField ) {

    this.setState( { editedField: null } );

    const schema = insertMissingAbstractFields( this.state.schema, this.state.mergedSchema );

    this.updateSchema( updateSchemaField( schema, updatedField ) );

  }

  generateMergedSchemas( schema, extensions ) {

    return merge.apply( null, extensions.map( e => e.schema ).concat( schema ) );

  }

  render() {

    const {
      addEnabled,
      extendedFrom,
      lang
    } = this.props;

    const {
      labels,
      labelLanguages,
      editedField,
      mergedSchema,
      saveState
    } = this.state;

    const disabled = saveState === saveStates.LOADING;

    return <div className="form-schema-builder">
      <div className="margin-bottom-sm">
        <div className="wsq padding-v-sm padding-h-sm">
          <h2 className="padding-bottom-sm">Paramètres généraux</h2>
          {<LabelLanguages lang={lang} labelLanguages={labelLanguages} onUpdate={labelLanguages => this.setState( { labelLanguages } ) }/>}
          <p>Les champs sont triables. Glissez-déposez chaque champ dans l'emplacement désiré</p>
          <SaveButton lang={lang} onClick={() => this.onSave() } saveState={saveState} />
        </div>
        <div>
          <div className="wsq padding-v-xs padding-h-sm">
            <h2>Champs du formulaire</h2>
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
                      isDragDisabled={disabled}
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
                            disabled={disabled || ( editedField && ( editedField !== field.field ) )}
                            editing={editedField===field.field}
                            field={field}
                            schemaInfo={extractSchemaInfo( field, extendedFrom )}
                            lang={this.props.lang}
                            labelLanguages={labelLanguages}
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
      </div>
      { addEnabled ?
        <button className="btn btn-primary">{getLabel( 'addField', this.props.lang )}</button>
      : null }
    </div>

  }

}
