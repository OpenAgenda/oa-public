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
import FieldOrderActions from './Components/FieldOrderActions';
import SaveButton from './Components/SaveButton';
import AddField from './Components/AddField';
import EditField from './Components/EditField';


const getLabel = makeLabelGetter( labels );

const modes = {
  ORDERING: 1,
  EDITLABELLANGUAGES: 2,
  ADDFIELD: 3
}

export default class FormSchemaBuilder extends Component {

  constructor( props ) {

    super( props );

    const mergedSchema = this.getMergedSchema( props );

    const initState = {
      schema: _.get( props, 'schema', { fields: [] } ),
      labelLanguages: extractSchemaLabelLanguages( mergedSchema ),
      saveState: saveStates.UNCHANGED,
      editedField: null,
      mode: null,
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

    this.updateSchema( insertMissingAbstractFields( this.getSchema(), reorderedSchema ) );

  }

  updateSchema( schema ) {

    this.setState( {
      schema,
      saveState: saveStates.CHANGED
    } );

    this.props.onUpdate( schema );

  }

  onCancelOrder( previousOrder ) {

    this.setState( {
      mode: null,
      mergedSchema: reorderSchemaFields.applyOrder( this.getMergedSchema(), previousOrder )
    } );

  }

  onSave() {

    this.setState( { saveState: saveStates.LOADING } );

    submit( { values: this.getSchema() } ).then( () => {

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

    this.updateSchema( removeSchemaField( this.getSchema(), field ) );

  }

  onFieldEditCancel() {

    this.setState( { editedField: null } );

  }

  getSchema() {

    return this.state.schema || { fields: [] };

  }

  onFieldAdd( field ) {

    this.updateSchema( addSchemaField( this.getSchema(), field ) );

  }

  onFieldEditSave( updatedField ) {

    this.setState( { editedField: null } );

    const schema = insertMissingAbstractFields( this.getSchema(), this.getMergedSchema() );

    this.updateSchema( updateSchemaField( schema, updatedField ) );

  }

  getMergedSchema( props ) {

    const currentSchema = props ? props.schema : this.getSchema();
    const extensions = props ? props.extendedFrom : this.props.extendedFrom;

    return merge.apply( null, extensions.map( e => e.schema ).concat( currentSchema ) );

  }

  isDisabled( actionName ) {

    const {
      mode,
      saveState
    } = this.state;

    if ( saveState === saveStates.LOADING ) return true;

    if ( mode && mode !== actionName ) return true;

    return false;

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
      mode,
      schema
    } = this.state;

    const mergedSchema = this.getMergedSchema();

    const disabled = saveState === saveStates.LOADING;

    return <div className="form-schema-builder row">
      <div className="col-sm-12 col-md-5 col-md-push-7">
        <div className="wsq padding-all-sm">
          <LabelLanguages
            disabled={this.isDisabled( modes.EDITLABELLANGUAGES )}
            lang={lang}
            labelLanguages={labelLanguages}
            onUpdate={labelLanguages => this.setState( { labelLanguages } ) }
          />
          <div className="padding-top-sm">
            <FieldOrder
              disabled={mode === modes.ORDERING || this.isDisabled( modes.ORDERING )}
              lang={lang}
              onStartOrder={()=>{ this.setState( { mode: modes.ORDERING } )}}
            />
          </div>
          <div className="padding-top-sm">
            <SaveButton
              disabled={mode}
              lang={lang}
              onClick={() => this.onSave() }
              saveState={saveState}
              block={true}
            />
          </div>
        </div>
      </div>
      <div className="col-sm-12 col-md-7 col-md-pull-5">
        <div className="wsq">
          { editedField ? <EditField
            isOwnField={isOwnField( schema, editedField )}
            field={editedField}
            labelLanguages={labelLanguages}
            lang={lang}
            onSave={this.onFieldEditSave.bind( this )}
            onCancel={this.onFieldEditCancel.bind( this )}
          /> : null }
          <div>
            { mode === modes.ORDERING ? <FieldOrderActions
              lang={lang}
              fields={mergedSchema.fields}
              onFinishOrder={()=>{ this.setState( { mode: null } )}}
              onCancel={this.onCancelOrder.bind( this )}
            /> : null }
            <DragDropContext
              onDragEnd={this.onDragEnd.bind( this )}>
              <Droppable droppableId="droppable">
                {( provided, snapshot ) => (
                  <div
                    className={'list-group field-preview-canvas wsq' + ( editedField ? ' editing' : '' )}
                    ref={provided.innerRef}
                    style={getDraggableListStyle(snapshot.isDraggingOver)}
                  >
                    {_.get( mergedSchema, 'fields', [] ).map( ( field, index ) => (
                      <Draggable
                        key={field.field}
                        draggableId={field.field}
                        isDragDisabled={mode !== modes.ORDERING}
                        index={index}>
                        {(provided, snapshot) => (
                          <div
                            className="list-group-item"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getDraggableListItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )} >
                            <FieldPreview
                              disabled={disabled || ( editedField && ( editedField !== field.field ) )}
                              ordering={mode === modes.ORDERING}
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
            <div className="padding-v-sm padding-h-sm">
              <div className="pull-right">
                <SaveButton disabled={mode} lang={lang} onClick={() => this.onSave() } saveState={saveState} />
              </div>
              <AddField disabled={this.isDisabled( modes.ADDFIELD )} labelLanguages={labelLanguages} lang={lang} onAdd={this.onFieldAdd.bind( this )} />
            </div>
          </div>
        </div>
      </div>
    </div>

  }

}
