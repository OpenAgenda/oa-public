import _ from 'lodash';
import debug from 'debug';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { DragDropProvider } from '@dnd-kit/react';

import { unloadWarning } from '@openagenda/react-shared';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';

import submit from '../lib/submit.js';
import merge from '../iso/merge.js';
import labels from './lib/labels.js';

import isOwnField from './lib/isOwnField.js';

import extractSchemaInfo from './lib/extractSchemaInfo.js';
import insertMissingAbstractFields from './lib/insertMissingAbstractFields.js';
import reorderSchemaFields from './lib/reorderSchemaFields.js';
import saveStates from './lib/saveStates.js';
import updateSchemaField from './lib/updateSchemaField.js';
import addSchemaField from './lib/addSchemaField.js';
import removeSchemaField from './lib/removeSchemaField.js';
import restrictLabelLanguages from './lib/restrictLabelLanguages.js';
import extractSchemaLabelLanguages from './lib/extractSchemaLabelLanguages.js';
import monolingualizeSchema from './lib/monolingualizeSchema.js';
import getFormItemSlug from './lib/getFormItemSlug.js';

import FieldPreview from './FieldPreview/index.js';
import LabelLanguages from './LabelLanguages.js';
import SaveButton from './SaveButton.js';
import FieldAdd from './FieldAdd.js';
import FieldEdit from './FieldEdit.js';

const modes = {
  DEFAULT: 0,
  EDITLABELLANGUAGES: 1,
  ADDFIELD: 2,
};

function isObjectWithKeys(obj) {
  return (
    obj !== null
    && typeof obj === 'object'
    && !Array.isArray(obj)
    && Object.keys(obj).length > 0
  );
}

const getLabel = makeLabelGetter(labels);

const log = debug('FormSchemaBuilder');

const FieldAddButton = ({ onClick, lang, disabled, block }) => (
  <button
    disabled={disabled}
    type="button"
    className={`btn btn-primary ${block ? 'btn-block' : ''}`}
    onClick={onClick}
  >
    {getLabel('addField', lang)}
  </button>
);

const FormSchemaBuilder = ({
  schema: initialSchema,
  useExtendedLabelLanguages,
  devState,
  addEnabled,
  settingsEnabled,
  editableExtensions,
  extendedFrom = [],
  lang,
  customFieldConfigurationSchemas,
  components,
  displaySidebar = true,
  onUpdate,
  onSuccess,
  res,
}) => {
  // Helper functions
  const getSchema = useCallback((schemaState) => {
    const defaultSchema = { fields: [] };
    return schemaState === null ? defaultSchema : schemaState || defaultSchema;
  }, []);

  const getMergedSchema = useCallback(
    (currentSchema) => {
      const extensions = extendedFrom;
      const merged = merge(
        ...extensions.map((e) => e.schema).concat(currentSchema),
      );

      return {
        ...merged,
        fields: merged.fields.filter((f) => f?.fieldType !== 'abstract'),
      };
    },
    [extendedFrom],
  );

  const getMergedExtentionSchema = useCallback(
    () => merge(...extendedFrom.map((e) => e.schema)),
    [extendedFrom],
  );

  // State initialization
  const initSchema = useMemo(
    () => (initialSchema?.fields ? initialSchema : { fields: [] }),
    [initialSchema],
  );
  const mergedInitialSchema = getMergedSchema(initSchema);

  const [schema, setSchema] = useState(initSchema);
  const [labelLanguages, setLabelLanguages] = useState(
    extractSchemaLabelLanguages(
      useExtendedLabelLanguages ? mergedInitialSchema : initialSchema,
    ),
  );
  const [saveState, setSaveState] = useState(saveStates.UNCHANGED);
  const [editedField, setEditedField] = useState(null);
  const [mode, setMode] = useState(null);
  const [activeItemSlug, setActiveItemSlug] = useState(null);
  const [addToEnd, setAddToEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragKey, setDragKey] = useState(0);

  useEffect(() => {
    if (isObjectWithKeys(devState)) {
      setSchema(devState.schema || initSchema);
      setLabelLanguages(devState.labelLanguages || []);
      setSaveState(devState.saveState || saveStates.UNCHANGED);
      setEditedField(devState.editedField || null);
      setMode(devState.mode || null);
      setActiveItemSlug(devState.activeItemSlug || null);
    }
  }, [devState, initSchema]);

  // Save state management
  const updateSaveState = useCallback(
    (newSaveState, schemaUpdate = null) => {
      if (newSaveState === saveStates.SAVED) {
        unloadWarning.unset();
      } else {
        unloadWarning.set();
      }

      setSaveState(newSaveState);
      if (schemaUpdate) {
        setSchema(schemaUpdate);
        onUpdate(schemaUpdate);
      }
    },
    [onUpdate],
  );

  // Event handlers
  const handleAccordionToggle = useCallback(
    (field) => {
      if (isDragging) return;
      const slug = getFormItemSlug(field);
      setActiveItemSlug((prev) => (prev === slug ? null : slug));
    },
    [isDragging],
  );

  const handleSave = useCallback(() => {
    updateSaveState(saveStates.LOADING);

    submit({
      res,
      values: restrictLabelLanguages.applyToSchema(
        getSchema(schema),
        labelLanguages,
      ),
    }).then(
      ({ body }) => {
        updateSaveState(saveStates.SAVED, body);
        if (onSuccess) onSuccess();
      },
      (_err) => {
        updateSaveState(saveStates.ERROR);
      },
    );
  }, [schema, labelLanguages, res, onSuccess, getSchema, updateSaveState]);

  const handleFieldEdit = useCallback((field) => {
    setEditedField(field);
  }, []);

  const handleFieldRemove = useCallback(
    (field) => {
      const updatedSchema = removeSchemaField(getSchema(schema), field);
      updateSaveState(saveStates.CHANGED, updatedSchema);
    },
    [schema, getSchema, updateSaveState],
  );

  const handleFieldEditCancel = useCallback(() => {
    setEditedField(null);
  }, []);

  const handleFieldAdd = useCallback(
    (field) => {
      const currentSchema = getSchema(schema);
      const mergedSchema = getMergedSchema(currentSchema);
      const schemaWithAbstractFields = insertMissingAbstractFields(
        currentSchema,
        mergedSchema,
      );

      log(
        'adding field on schema of %s fields, %s when merged',
        currentSchema.fields.length,
        mergedSchema.fields.length,
      );

      const updatedSchema = addSchemaField(
        schemaWithAbstractFields,
        field,
        addToEnd,
      );
      updateSaveState(saveStates.CHANGED, updatedSchema);
      setMode(modes.DEFAULT);
    },
    [schema, addToEnd, getMergedSchema, getSchema, updateSaveState],
  );

  const handleFieldEditSave = useCallback(
    (field, update) => {
      setEditedField(null);

      const currentSchema = insertMissingAbstractFields(
        getSchema(schema),
        getMergedSchema(schema),
      );

      const updatedSchema = updateSchemaField(currentSchema, field, update);
      updateSaveState(saveStates.CHANGED, updatedSchema);
    },
    [schema, getMergedSchema, getSchema, updateSaveState],
  );

  const handleLabelLanguagesChange = useCallback(
    (updatedLabelLanguages) => {
      const wasMonolingualized = !updatedLabelLanguages.length && labelLanguages.length;

      setLabelLanguages(updatedLabelLanguages);
      updateSaveState(saveStates.CHANGED);

      if (wasMonolingualized) {
        const updatedSchema = monolingualizeSchema(getSchema(schema));
        updateSaveState(saveStates.CHANGED, updatedSchema);
      }
    },
    [labelLanguages, schema, getSchema, updateSaveState],
  );

  // Helper functions for UI state
  const isDisabled = useCallback(
    (actionName) => {
      if (saveState === saveStates.LOADING) return true;
      if (mode && mode !== actionName) return true;
      return false;
    },
    [mode, saveState],
  );

  const isFieldDisabled = useCallback(
    (field, forceDisabled) => {
      if (forceDisabled) return true;
      if (!_.get(field, 'display', true)) return true;
      return editedField && editedField !== field.field;
    },
    [editedField],
  );

  const mergedSchema = useMemo(
    () => getMergedSchema(schema),
    [schema, getMergedSchema],
  );
  const parentsMergedSchema = getMergedExtentionSchema();
  const disabled = saveState === saveStates.LOADING;

  useEffect(() => {
    if (!isDragging && schema !== initialSchema) {
      setDragKey((prev) => prev + 1);
    }
  }, [schema, isDragging, initialSchema]);

  return (
    <div className="form-schema-builder dnd row">
      {displaySidebar ? (
        <div className="col-sm-12 padding-bottom-sm">
          <div className="padding-all-sm">
            {settingsEnabled ? (
              <LabelLanguages
                disabled={isDisabled(modes.EDITLABELLANGUAGES)}
                lang={lang}
                labelLanguages={labelLanguages}
                onUpdate={handleLabelLanguagesChange}
              />
            ) : null}
            <div className="form-inline">
              <FieldAddButton
                disabled={!addEnabled || isDisabled(modes.ADDFIELD)}
                lang={lang}
                onClick={() => {
                  setMode(modes.ADDFIELD);
                  setAddToEnd(false);
                }}
              />
              <SaveButton
                disabled={mode}
                lang={lang}
                onClick={handleSave}
                saveState={saveState}
              />
            </div>
          </div>
        </div>
      ) : null}
      <div className="col-sm-12">
        {editedField ? (
          <FieldEdit
            isOwnField={isOwnField(schema, editedField)}
            field={editedField}
            labelLanguages={labelLanguages}
            lang={lang}
            onSave={(update) => handleFieldEditSave(editedField, update)}
            onCancel={handleFieldEditCancel}
            customFieldConfigurationSchemas={customFieldConfigurationSchemas}
            components={components}
            parentsFields={parentsMergedSchema}
          />
        ) : null}
        <div
          className={`margin-h-sm list-group field-preview-canvas ${editedField ? ' editing' : ''}`}
        >
          <DragDropProvider
            key={dragKey}
            onDragStart={(event) => {
              event?.event?.stopPropagation();
              setIsDragging(true);
            }}
            onDragEnd={(event) => {
              if (event.event) {
                event.event.stopPropagation();
                event.event.preventDefault();
              }
              const from = event?.operation?.source?.sortable?.initialIndex;
              const to = event?.operation?.target?.sortable?.index ?? from;
              if (from === undefined || to === undefined || from === to) {
                return;
              }
              const reorderedSchema = reorderSchemaFields(
                getMergedSchema(schema),
                from,
                to,
              );
              const updatedSchema = insertMissingAbstractFields(
                getSchema(schema),
                reorderedSchema,
              );
              updateSaveState(saveStates.CHANGED, updatedSchema);
              setTimeout(() => setIsDragging(false), 100);
            }}
          >
            {(mergedSchema?.fields || []).map((field, index) => (
              <FieldPreview
                index={index}
                disabled={isFieldDisabled(field, disabled)}
                ordering={mode === modes.ORDERING}
                field={field}
                isOwn={isOwnField(schema, field)}
                editableExtensions={editableExtensions}
                schemaInfo={extractSchemaInfo(field, extendedFrom)}
                lang={lang}
                labelLanguages={labelLanguages}
                onEdit={() => handleFieldEdit(field)}
                onHide={() => handleFieldEditSave(field, { display: false })}
                onShow={() => handleFieldEditSave(field, { display: true })}
                onRemove={() => handleFieldRemove(field)}
                onAccordionToggle={() => handleAccordionToggle(field)}
                active={activeItemSlug === getFormItemSlug(field)}
                schema={mergedSchema}
                key={field.field}
                isDragging={isDragging}
              />
            ))}
          </DragDropProvider>
          {addEnabled ? (
            <div className="padding-v-sm">
              <FieldAddButton
                block
                disabled={isDisabled(modes.ADDFIELD)}
                lang={lang}
                onClick={() => {
                  setMode(modes.ADDFIELD);
                  setAddToEnd(true);
                }}
              />
            </div>
          ) : null}
          {mode === modes.ADDFIELD ? (
            <FieldAdd
              schema={mergedSchema}
              labelLanguages={labelLanguages}
              lang={lang}
              onAdd={handleFieldAdd}
              onClose={() => setMode(modes.DEFAULT)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FormSchemaBuilder;
