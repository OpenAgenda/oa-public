import _ from 'lodash';
import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import labels from './lib/builderLabels';

import isEmptySchema from './lib/isEmptySchema';
import isOwnField from './lib/isOwnField';
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
import addSchemaField from './lib/addSchemaField';
import removeSchemaField from './lib/removeSchemaField';
import extractSchemaLabelLanguages from './lib/extractSchemaLabelLanguages';
import submit from './lib/submit';

import FieldPreview from './Components/FieldPreview';
import LabelLanguages from './Components/LabelLanguages';
import FieldOrder from './Components/FieldOrder';
import SaveButton from './Components/SaveButton';
import AddField from './Components/AddField';
import EditField from './Components/EditField';

const getLabel = makeLabelGetter( labels );

export default class FormSchemaComponent extends Component {

  constructor( props ) {

    super( props );

    const mergedSchema = this.getMergedSchema( props );

    const initState = {
      schema: props.schema,
      labelLanguages: extractSchemaLabelLanguages( mergedSchema ),
      saveState: saveStates.UNCHANGED,
      editedField: null,
      ordering: false,
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
      this.getMergedSchema(),
      source.index,
      destination.index
    );

    this.updateSchema( insertMissingAbstractFields( this.state.schema, reorderedSchema ) );

  }

  updateSchema( schema ) {

    this.setState( {
      schema,
      saveState: saveStates.CHANGED
    } );

    this.props.onUpdate( schema );

  }

  onStartOrder() {

    this.setState( { ordering: true } );

  }

  onCancelOrder( previousOrder ) {

    this.setState( {
      ordering: false,
      mergedSchema: reorderSchemaFields.applyOrder( this.getMergedSchema(), previousOrder )
    } );

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

    this.setState( { editedField: field } );

  }

  onFieldRemove( field ) {

    this.setState( {
      schema: removeSchemaField( this.state.schema, field )
    } );

  }

  onFieldEditCancel() {

    this.setState( { editedField: null } );

  }

  onFieldAdd( field ) {

    const schema = addSchemaField( this.state.schema, field );

    this.setState( { schema } );

  }

  onFieldEditSave( updatedField ) {

    this.setState( { editedField: null } );

    const schema = insertMissingAbstractFields( this.state.schema, this.getMergedSchema() );

    this.updateSchema( updateSchemaField( schema, updatedField ) );

  }

  getMergedSchema( props ) {

    const currentSchema = props ? props.schema : this.state.schema;
    const extensions = props ? props.extendedFrom : this.props.extendedFrom;

    return merge.apply( null, extensions.map( e => e.schema ).concat( currentSchema ) );

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
      saveState,
      ordering,
      schema
    } = this.state;

    const mergedSchema = this.getMergedSchema();

    const disabled = saveState === saveStates.LOADING;

    return <div className="form-schema-builder">
      <div className="margin-bottom-sm">
        <div className="wsq padding-v-sm padding-h-sm">
          <h2 className="padding-bottom-sm">Paramètres généraux</h2>
          <LabelLanguages
            disabled={disabled}
            lang={lang}
            labelLanguages={labelLanguages}
            onUpdate={labelLanguages => this.setState( { labelLanguages } ) }
          />
          <FieldOrder
            disabled={disabled}
            fields={mergedSchema.fields}
            ordering={ordering}
            lang={lang}
            onStartOrder={()=>{ this.setState( { ordering: true } )}}
            onFinishOrder={()=>{ this.setState( { ordering: false } )}}
            onCancel={initialOrder=>this.onCancelOrder( initialOrder )}
          />
          <div className="margin-top-sm">
            <AddField labelLanguages={labelLanguages} lang={lang} onAdd={this.onFieldAdd.bind( this )} />
            <SaveButton lang={lang} onClick={() => this.onSave() } saveState={saveState} />
          </div>
          { editedField ? <EditField
            isOwnField={isOwnField( schema, editedField )}
            field={editedField}
            labelLanguages={labelLanguages}
            lang={lang}
            onSave={this.onFieldEditSave.bind( this )}
            onCancel={this.onFieldEditCancel.bind( this )}
          /> : null }
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
                  className={'field-preview-canvas wsq' + ( editedField ? ' editing' : '' )}
                  ref={provided.innerRef}
                  style={getDraggableListStyle(snapshot.isDraggingOver)}
                >
                  {_.get( mergedSchema, 'fields', [] ).map( ( field, index ) => (
                    <Draggable
                      key={field.field}
                      draggableId={field.field}
                      isDragDisabled={!ordering}
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
                            ordering={ordering}
                            field={field}
                            isOwnField={isOwnField( schema, field )}
                            schemaInfo={extractSchemaInfo( field, extendedFrom )}
                            lang={this.props.lang}
                            labelLanguages={labelLanguages}
                            onEdit={this.onFieldEdit.bind( this, field )}
                            onRemove={this.onFieldRemove.bind( this, field )}
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
