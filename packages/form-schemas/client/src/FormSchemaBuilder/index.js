import _ from 'lodash';
import classNames from 'classnames';
import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { unloadWarning } from '@openagenda/react-shared';
import submit from '../lib/submit';
import merge from '../iso/merge';
import labels from './lib/labels';

import isOwnField from './lib/isOwnField';
import draggableStyles from './lib/draggableStyles';

import extractSchemaInfo from './lib/extractSchemaInfo';
import insertMissingAbstractFields from './lib/insertMissingAbstractFields';
import reorderSchemaFields from './lib/reorderSchemaFields';
import saveStates from './lib/saveStates';
import updateSchemaField from './lib/updateSchemaField';
import addSchemaField from './lib/addSchemaField';
import removeSchemaField from './lib/removeSchemaField';
import restrictLabelLanguages from './lib/restrictLabelLanguages';
import extractSchemaLabelLanguages from './lib/extractSchemaLabelLanguages';

import FieldPreview from './FieldPreview';
import LabelLanguages from './LabelLanguages';
import SaveButton from './SaveButton';
import FieldAdd from './FieldAdd';
import FieldEdit from './FieldEdit';

const modes = {
  ORDERING: 1,
  EDITLABELLANGUAGES: 2,
  ADDFIELD: 3
};

export default class FormSchemaBuilder extends Component {
  constructor(props) {
    super(props);

    const mergedSchema = this.getMergedSchema(props);

    const initState = {
      schema: _.get(props, 'schema', { fields: [] }),
      labelLanguages: extractSchemaLabelLanguages(props.useExtendedLabelLanguages ? mergedSchema : props.schema),
      saveState: saveStates.UNCHANGED,
      editedField: null,
      mode: null,
      labels
    };

    if (props.devState) {
      Object.assign(initState, props.devState);
    }

    this.state = initState;

    this.onFieldEditCancel = this.onFieldEditCancel.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd({ source, destination }) {
    if (!destination) return;

    const reorderedSchema = reorderSchemaFields(
      this.getMergedSchema(),
      source.index,
      destination.index
    );

    this.updateSchema(insertMissingAbstractFields(this.getSchema(), reorderedSchema));
  }

  onSave() {
    this.setSaveState(saveStates.LOADING);

    const {
      labelLanguages
    } = this.state;

    submit({
      values: restrictLabelLanguages.applyToSchema(
        this.getSchema(),
        labelLanguages
      )
    }).then(() => {
      this.setSaveState(saveStates.SAVED);
    }, _err => {
      this.setSaveState(saveStates.ERROR);
    });
  }

  onFieldEdit(field) {
    this.setState({ editedField: field });
  }

  onFieldRemove(field) {
    this.updateSchema(removeSchemaField(this.getSchema(), field));
  }

  onFieldEditCancel() {
    this.setState({ editedField: null });
  }

  onFieldAdd(addToEnd, field) {
    this.updateSchema(addSchemaField(this.getSchema(), field, addToEnd));
  }

  onFieldEditSave(field, update, /* parentField */) {
    this.setState({ editedField: null });

    const schema = insertMissingAbstractFields(this.getSchema(), this.getMergedSchema());

    this.updateSchema(updateSchemaField(schema, field, update, /* { fieldValidator } */));
  }

  getSchema() {
    const {
      schema = { fields: [] }
    } = this.state;

    return schema;
  }

  setSaveState(newSaveState, otherStateSet = {}) {
    if (newSaveState === saveStates.SAVED) {
      unloadWarning.unset();
    } else {
      unloadWarning.set();
    }

    this.setState({
      saveState: newSaveState,
      ...otherStateSet
    });
  }

  getMergedSchema(props) {
    const currentSchema = props ? props.schema : this.getSchema();
    const extensions = _.get(props || this.props, 'extendedFrom', []);

    return merge(...extensions.map(e => e.schema).concat(currentSchema));
  }

  getMergedExtentionSchema(props) {
    const extensions = _.get(props || this.props, 'extendedFrom', []);
    return merge(...extensions.map(e => e.schema));
  }

  updateSchema(schema) {
    const { onUpdate } = this.props;
    this.setSaveState(saveStates.CHANGED, { schema });
    onUpdate(schema);
  }

  isDisabled(actionName) {
    const {
      mode,
      saveState
    } = this.state;

    if (saveState === saveStates.LOADING) return true;

    if (mode && mode !== actionName) return true;

    return false;
  }

  isFieldDisabled(field, forceDisabled) {
    if (forceDisabled) return true;

    const { editedField } = this.state;

    if (!_.get(field, 'display', true)) return true;

    return editedField && (editedField !== field.field);
  }

  renderFieldListHead() {
    const { labelLanguages } = this.state;
    const { lang, renderHead, addEnabled } = this.props;

    return (
      <div>{renderHead ? renderHead() : null} {addEnabled ? (
        <div className="padding-v-sm padding-h-sm">
          <FieldAdd
            disabled={this.isDisabled(modes.ADDFIELD)}
            labelLanguages={labelLanguages}
            lang={lang}
            onAdd={field => this.onFieldAdd(false, field)}
          />
        </div>
      ) : null}
      </div>
    );
  }

  render() {
    const {
      addEnabled,
      settingsEnabled,
      editableExtensions,
      extendedFrom,
      lang,
      customFieldConfigurationSchemas,
      components
    } = this.props;

    const {
      labelLanguages,
      editedField,
      saveState,
      mode,
      schema
    } = this.state;

    const mergedSchema = this.getMergedSchema();
    const parentsMergedSchema = this.getMergedExtentionSchema();
    const disabled = saveState === saveStates.LOADING;

    return (
      <div className="form-schema-builder row">
        <div className="col-sm-12 col-md-5 col-md-push-7">
          <div className="wsq padding-all-sm">
            {settingsEnabled ? (
              <LabelLanguages
                disabled={this.isDisabled(modes.EDITLABELLANGUAGES)}
                lang={lang}
                labelLanguages={labelLanguages}
                onUpdate={updatedLabelLanguages => this.setState({
                  labelLanguages: updatedLabelLanguages,
                  saveState: saveStates.CHANGED
                })}
              />
            ) : null}
            <div className="padding-bottom-sm">
              <SaveButton
                disabled={mode}
                lang={lang}
                onClick={() => this.onSave()}
                saveState={saveState}
                block
              />
            </div>
          </div>
        </div>
        <div className="col-sm-12 col-md-7 col-md-pull-5">
          {editedField ? (
            <FieldEdit
              isOwnField={isOwnField(schema, editedField)}
              field={editedField}
              labelLanguages={labelLanguages}
              lang={lang}
              onSave={update => this.onFieldEditSave(editedField, update)}
              onCancel={this.onFieldEditCancel}
              customFieldConfigurationSchemas={customFieldConfigurationSchemas}
              components={components}
              parentsFields={parentsMergedSchema}
            />
          ) : null}
          <div>
            {this.renderFieldListHead(mergedSchema)}
            <DragDropContext
              className="list-group"
              onDragEnd={this.onDragEnd}
            >
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    className={`list-group field-preview-canvas wsq${editedField ? ' editing' : ''}`}
                    ref={provided.innerRef}
                    style={draggableStyles.getDraggableListStyle(snapshot.isDraggingOver)}
                  >
                    {_.get(mergedSchema, 'fields', []).map((field, index) => (
                      <Draggable
                        key={field.field}
                        draggableId={field.field}
                        // isDragDisabled={mode !== modes.ORDERING}
                        index={index}
                      >
                        {(providedInner, draggableSnapshot) => (
                          <div
                            className={classNames({
                              'list-group-item draggable': true,
                              dragged: draggableSnapshot.isDragging,
                              disabled: this.isFieldDisabled(field, disabled)
                            })}
                            ref={providedInner.innerRef}
                            {...providedInner.draggableProps}
                            {...providedInner.dragHandleProps}
                            style={draggableStyles.getDraggableListItemStyle(
                              draggableSnapshot.isDragging,
                              providedInner.draggableProps.style
                            )}
                          >
                            <FieldPreview
                              disabled={this.isFieldDisabled(field, disabled)}
                              ordering={mode === modes.ORDERING}
                              field={field}
                              isOwn={isOwnField(schema, field)}
                              editableExtensions={editableExtensions}
                              schemaInfo={extractSchemaInfo(field, extendedFrom)}
                              lang={lang}
                              labelLanguages={labelLanguages}
                              onEdit={() => this.onFieldEdit(field)}
                              onHide={() => this.onFieldEditSave(field, { display: false })}
                              onShow={() => this.onFieldEditSave(field, { display: true })}
                              onRemove={() => this.onFieldRemove(field)}
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
            {addEnabled ? (
              <div className="padding-v-sm padding-h-sm">
                <FieldAdd
                  disabled={this.isDisabled(modes.ADDFIELD)}
                  labelLanguages={labelLanguages}
                  lang={lang}
                  onAdd={addedField => this.onFieldAdd(true, addedField)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
