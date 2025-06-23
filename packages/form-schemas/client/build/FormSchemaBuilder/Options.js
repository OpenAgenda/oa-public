import _isArray from "lodash/isArray.js";
import _set from "lodash/set.js";
import _assign from "lodash/assign.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/Options.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
import ih from 'immutability-helper';
import { useState, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { dragAndDrop } from '@openagenda/react-shared';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import labels from './lib/labels.js';
import OptionLabelsForm from './OptionLabelsForm.js';
import OptionItem from './OptionItem.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const {
  arrayMove
} = dragAndDrop;
const getLabel = makeLabelGetter(labels);
const modes = {
  ADDING: 0,
  EDITING: 1
};
const Options = _ref => {
  let {
    field,
    value,
    lang,
    onChange
  } = _ref;
  const [mode, setMode] = useState(() => {
    var _field$devInitState$m, _field$devInitState;
    return (_field$devInitState$m = (_field$devInitState = field.devInitState) === null || _field$devInitState === void 0 ? void 0 : _field$devInitState.mode) !== null && _field$devInitState$m !== void 0 ? _field$devInitState$m : null;
  });
  const [editedIndex, setEditedIndex] = useState(() => {
    var _field$devInitState$e, _field$devInitState2;
    return (_field$devInitState$e = (_field$devInitState2 = field.devInitState) === null || _field$devInitState2 === void 0 ? void 0 : _field$devInitState2.editedIndex) !== null && _field$devInitState$e !== void 0 ? _field$devInitState$e : null;
  });
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8
    }
  }), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));
  const getOptions = useCallback(() => value || [], [value]);
  const addOption = useCallback(newOption => {
    onChange(getOptions().concat(newOption));
  }, [getOptions, onChange]);
  const editOption = useCallback(index => {
    setMode(modes.EDITING);
    setEditedIndex(index);
  }, []);
  const removeOption = useCallback(index => {
    onChange(ih(getOptions(), {
      $splice: [[index, 1]]
    }));
  }, [getOptions, onChange]);
  const updateOption = useCallback((index, option) => {
    const options = getOptions();
    const optionWithId = _assign({
      id: options[index].id
    }, option);
    onChange(_set(options, index, optionWithId));
    setMode(null);
  }, [getOptions, onChange]);
  const isOptionActionable = useCallback(() => {
    var _context;
    return !_includesInstanceProperty(_context = [modes.EDITING]).call(_context, mode);
  }, [mode]);
  const isOptionDisabled = useCallback(index => {
    if (mode === modes.ADDING) return false;
    if (mode === modes.EDITING && index !== editedIndex) return true;
    return false;
  }, [mode, editedIndex]);
  const renderAdd = () => {
    var _context2;
    if (!_includesInstanceProperty(_context2 = [modes.ADDING]).call(_context2, mode)) {
      return /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        disabled: mode !== null,
        className: "btn btn-primary margin-top-md",
        onClick: () => setMode(modes.ADDING),
        children: getLabel('optionAdd', lang)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 104,
        columnNumber: 9
      }, this);
    }
    if (mode === modes.ADDING) {
      return /*#__PURE__*/_jsxDEV("div", {
        className: "margin-top-md",
        children: /*#__PURE__*/_jsxDEV(OptionLabelsForm, {
          otherOptions: getOptions(),
          onSubmit: (i, o) => addOption(o),
          lang: lang,
          languages: _isArray(field.labelLanguages) && field.labelLanguages.length ? field.labelLanguages : null
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 118,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 117,
        columnNumber: 9
      }, this);
    }
  };
  const renderDraggableOptions = () => {
    const options = getOptions();
    return /*#__PURE__*/_jsxDEV(DndContext, {
      sensors: sensors,
      collisionDetection: closestCenter,
      modifiers: [restrictToVerticalAxis],
      onDragEnd: event => {
        const {
          active,
          over
        } = event;
        if (active.id !== over.id) {
          const mapped = options.map(o => o.value);
          const oldIndex = mapped.indexOf(active.id);
          const newIndex = mapped.indexOf(over.id);
          onChange(arrayMove(options, oldIndex, newIndex));
        }
      },
      children: /*#__PURE__*/_jsxDEV(SortableContext, {
        items: options.map(o => o.value),
        strategy: verticalListSortingStrategy,
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "list-group margin-v-sm",
          children: options.map((option, index) => /*#__PURE__*/_jsxDEV(OptionItem, {
            lang: lang,
            field: field,
            option: option,
            otherOptions: value.filter((o, i) => i !== index),
            index: index,
            isEdited: mode === modes.EDITING && index === editedIndex,
            actionable: isOptionActionable(),
            disabled: isOptionDisabled(index),
            onEdit: i => editOption(i),
            onEditCancel: () => setMode(null),
            onRemove: () => removeOption(index),
            onUpdate: (i, o) => updateOption(i, o),
            disableDnD: mode === modes.EDITING
          }, option.value, false, {
            fileName: _jsxFileName,
            lineNumber: 157,
            columnNumber: 15
          }, this))
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 155,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 151,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 137,
      columnNumber: 7
    }, this);
  };
  const options = getOptions();
  return /*#__PURE__*/_jsxDEV("div", {
    className: "options-field-form dnd",
    children: [options.length ? renderDraggableOptions() : /*#__PURE__*/_jsxDEV("div", {
      className: "margin-top-md margin-bottom-sm text-center",
      children: getLabel('emptyOptions', lang)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 187,
      columnNumber: 11
    }, this), renderAdd()]
  }, void 0, true, {
    fileName: _jsxFileName,
    lineNumber: 183,
    columnNumber: 5
  }, this);
};
export default Options;
//# sourceMappingURL=Options.js.map