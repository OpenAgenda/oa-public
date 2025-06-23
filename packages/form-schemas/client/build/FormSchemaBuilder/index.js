import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _get from "lodash/get.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/index.js";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
import debug from 'debug';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const modes = {
  DEFAULT: 0,
  EDITLABELLANGUAGES: 1,
  ADDFIELD: 2
};
function isObjectWithKeys(obj) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length > 0;
}
const getLabel = makeLabelGetter(labels);
const log = debug('FormSchemaBuilder');
const FieldAddButton = _ref => {
  let {
    onClick,
    lang,
    disabled,
    block
  } = _ref;
  return /*#__PURE__*/_jsxDEV("button", {
    disabled: disabled,
    type: "button",
    className: "btn btn-primary ".concat(block ? 'btn-block' : ''),
    onClick: onClick,
    children: getLabel('addField', lang)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 67,
    columnNumber: 3
  }, this);
};
const FormSchemaBuilder = _ref2 => {
  let {
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
    res
  } = _ref2;
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8
    }
  }), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));

  // Helper functions
  const getSchema = useCallback(schemaState => {
    const defaultSchema = {
      fields: []
    };
    return schemaState === null ? defaultSchema : schemaState || defaultSchema;
  }, []);
  const getMergedSchema = useCallback(currentSchema => {
    const extensions = extendedFrom;
    const merged = merge(...extensions.map(e => e.schema).concat(currentSchema));
    return _objectSpread(_objectSpread({}, merged), {}, {
      fields: merged.fields.filter(f => (f === null || f === void 0 ? void 0 : f.fieldType) !== 'abstract')
    });
  }, [extendedFrom]);
  const parentsMergedSchema = useMemo(() => merge(...extendedFrom.map(e => e.schema)), [extendedFrom]);

  // State initialization
  const initSchema = useMemo(() => initialSchema !== null && initialSchema !== void 0 && initialSchema.fields ? initialSchema : {
    fields: []
  }, [initialSchema]);
  const mergedInitialSchema = getMergedSchema(initSchema);
  const [schema, setSchema] = useState(initSchema);
  const [labelLanguages, setLabelLanguages] = useState(extractSchemaLabelLanguages(useExtendedLabelLanguages ? mergedInitialSchema : initialSchema));
  const [saveState, setSaveState] = useState(saveStates.UNCHANGED);
  const [editedField, setEditedField] = useState(null);
  const [mode, setMode] = useState(null);
  const [activeItemSlug, setActiveItemSlug] = useState(null);
  const [addToEnd, setAddToEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
  const updateSaveState = useCallback(function (newSaveState) {
    let schemaUpdate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
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
  }, [onUpdate]);

  // Event handlers
  const handleAccordionToggle = useCallback(field => {
    if (isDragging) return;
    const slug = getFormItemSlug(field);
    setActiveItemSlug(prev => prev === slug ? null : slug);
  }, [isDragging]);
  const handleSave = useCallback(() => {
    if (isDragging) return;
    updateSaveState(saveStates.LOADING);
    submit({
      res,
      values: restrictLabelLanguages.applyToSchema(getSchema(schema), labelLanguages)
    }).then(_ref3 => {
      let {
        body
      } = _ref3;
      updateSaveState(saveStates.SAVED, body);
      if (onSuccess) onSuccess();
    }, _err => {
      updateSaveState(saveStates.ERROR);
    });
  }, [schema, labelLanguages, res, onSuccess, getSchema, updateSaveState, isDragging]);
  const handleFieldEdit = useCallback(field => {
    if (!isDragging) setEditedField(field);
  }, [isDragging]);
  const handleFieldRemove = useCallback(field => {
    const updatedSchema = removeSchemaField(getSchema(schema), field);
    updateSaveState(saveStates.CHANGED, updatedSchema);
  }, [schema, getSchema, updateSaveState]);
  const handleFieldEditCancel = useCallback(() => {
    setEditedField(null);
  }, []);
  const handleFieldAdd = useCallback(field => {
    const currentSchema = getSchema(schema);
    const mergedSchema = getMergedSchema(currentSchema);
    const schemaWithAbstractFields = insertMissingAbstractFields(currentSchema, mergedSchema);
    log('adding field on schema of %s fields, %s when merged', currentSchema.fields.length, mergedSchema.fields.length);
    const updatedSchema = addSchemaField(schemaWithAbstractFields, field, addToEnd);
    updateSaveState(saveStates.CHANGED, updatedSchema);
    setMode(modes.DEFAULT);
  }, [schema, addToEnd, getMergedSchema, getSchema, updateSaveState]);
  const handleFieldEditSave = useCallback((field, update) => {
    setEditedField(null);
    const currentSchema = insertMissingAbstractFields(getSchema(schema), getMergedSchema(schema));
    const updatedSchema = updateSchemaField(currentSchema, field, update, parentsMergedSchema);
    updateSaveState(saveStates.CHANGED, updatedSchema);
  }, [schema, getMergedSchema, getSchema, updateSaveState, parentsMergedSchema]);
  const handleLabelLanguagesChange = useCallback(updatedLabelLanguages => {
    const wasMonolingualized = !updatedLabelLanguages.length && labelLanguages.length;
    setLabelLanguages(updatedLabelLanguages);
    updateSaveState(saveStates.CHANGED);
    if (wasMonolingualized) {
      const updatedSchema = monolingualizeSchema(getSchema(schema));
      updateSaveState(saveStates.CHANGED, updatedSchema);
    }
  }, [labelLanguages, schema, getSchema, updateSaveState]);

  // Helper functions for UI state
  const isDisabled = useCallback(actionName => {
    if (saveState === saveStates.LOADING) return true;
    if (mode && mode !== actionName) return true;
    return false;
  }, [mode, saveState]);
  const isFieldDisabled = useCallback((field, forceDisabled) => {
    if (forceDisabled) return true;
    if (!_get(field, 'display', true)) return true;
    return editedField && editedField !== field.field;
  }, [editedField]);
  const mergedSchema = useMemo(() => getMergedSchema(schema), [schema, getMergedSchema]);
  const disabled = saveState === saveStates.LOADING;
  return /*#__PURE__*/_jsxDEV("div", {
    className: "form-schema-builder dnd row",
    children: [displaySidebar ? /*#__PURE__*/_jsxDEV("div", {
      className: "col-sm-12 padding-bottom-sm",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "padding-all-sm",
        children: [settingsEnabled ? /*#__PURE__*/_jsxDEV(LabelLanguages, {
          disabled: isDisabled(modes.EDITLABELLANGUAGES),
          lang: lang,
          labelLanguages: labelLanguages,
          onUpdate: handleLabelLanguagesChange
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 331,
          columnNumber: 15
        }, this) : null, /*#__PURE__*/_jsxDEV("div", {
          className: "form-inline",
          children: [/*#__PURE__*/_jsxDEV(FieldAddButton, {
            disabled: !addEnabled || isDisabled(modes.ADDFIELD),
            lang: lang,
            onClick: () => {
              setMode(modes.ADDFIELD);
              setAddToEnd(false);
            }
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 339,
            columnNumber: 15
          }, this), /*#__PURE__*/_jsxDEV(SaveButton, {
            disabled: mode,
            lang: lang,
            onClick: handleSave,
            saveState: saveState
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 347,
            columnNumber: 15
          }, this)]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 338,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 329,
        columnNumber: 11
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 328,
      columnNumber: 9
    }, this) : null, /*#__PURE__*/_jsxDEV("div", {
      className: "col-sm-12",
      children: [editedField ? /*#__PURE__*/_jsxDEV(FieldEdit, {
        isOwnField: isOwnField(schema, editedField),
        field: editedField,
        labelLanguages: labelLanguages,
        lang: lang,
        onSave: update => handleFieldEditSave(editedField, update),
        onCancel: handleFieldEditCancel,
        customFieldConfigurationSchemas: customFieldConfigurationSchemas,
        components: components,
        parentsFields: parentsMergedSchema
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 359,
        columnNumber: 11
      }, this) : null, /*#__PURE__*/_jsxDEV("div", {
        className: "margin-h-sm list-group field-preview-canvas dnd".concat(editedField ? ' editing' : ''),
        children: [/*#__PURE__*/_jsxDEV(DndContext, {
          sensors: sensors,
          collisionDetection: closestCenter,
          onDragStart: () => {
            setIsDragging(true);
          },
          onDragEnd: event => {
            const {
              active,
              over
            } = event;
            if (active.id !== over.id) {
              const mapped = ((mergedSchema === null || mergedSchema === void 0 ? void 0 : mergedSchema.fields) || []).map(f => f.field || f.slug);
              const oldIndex = mapped.indexOf(active.id);
              const newIndex = mapped.indexOf(over.id);
              const reorderedSchema = reorderSchemaFields(getMergedSchema(schema), oldIndex, newIndex);
              const updatedSchema = insertMissingAbstractFields(getSchema(schema), reorderedSchema);
              updateSaveState(saveStates.CHANGED, updatedSchema);
            }
            setIsDragging(false);
          },
          children: /*#__PURE__*/_jsxDEV(SortableContext, {
            items: ((mergedSchema === null || mergedSchema === void 0 ? void 0 : mergedSchema.fields) || []).map(f => f.field || f.slug),
            strategy: verticalListSortingStrategy,
            children: ((mergedSchema === null || mergedSchema === void 0 ? void 0 : mergedSchema.fields) || []).map((field, index) => /*#__PURE__*/_jsxDEV(FieldPreview, {
              index: index,
              disabled: isFieldDisabled(field, disabled),
              ordering: mode === modes.ORDERING,
              field: field,
              isOwn: isOwnField(schema, field),
              editableExtensions: editableExtensions,
              schemaInfo: extractSchemaInfo(field, extendedFrom),
              lang: lang,
              labelLanguages: labelLanguages,
              onEdit: () => handleFieldEdit(field),
              onHide: () => handleFieldEditSave(field, {
                display: false
              }),
              onShow: () => handleFieldEditSave(field, {
                display: true
              }),
              onRemove: () => handleFieldRemove(field),
              onAccordionToggle: () => handleAccordionToggle(field),
              active: activeItemSlug === getFormItemSlug(field),
              schema: mergedSchema,
              isDragging: isDragging
            }, field.field || field.slug, false, {
              fileName: _jsxFileName,
              lineNumber: 407,
              columnNumber: 17
            }, this))
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 402,
            columnNumber: 13
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 374,
          columnNumber: 11
        }, this), addEnabled ? /*#__PURE__*/_jsxDEV("div", {
          className: "padding-v-sm",
          children: /*#__PURE__*/_jsxDEV(FieldAddButton, {
            block: true,
            disabled: isDisabled(modes.ADDFIELD),
            lang: lang,
            onClick: () => {
              setMode(modes.ADDFIELD);
              setAddToEnd(true);
            }
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 432,
            columnNumber: 15
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 431,
          columnNumber: 13
        }, this) : null, mode === modes.ADDFIELD ? /*#__PURE__*/_jsxDEV(FieldAdd, {
          schema: mergedSchema,
          labelLanguages: labelLanguages,
          lang: lang,
          onAdd: handleFieldAdd,
          onClose: () => setMode(modes.DEFAULT)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 444,
          columnNumber: 13
        }, this) : null]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 371,
        columnNumber: 9
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 357,
      columnNumber: 7
    }, this)]
  }, void 0, true, {
    fileName: _jsxFileName,
    lineNumber: 326,
    columnNumber: 5
  }, this);
};
export default FormSchemaBuilder;
//# sourceMappingURL=index.js.map