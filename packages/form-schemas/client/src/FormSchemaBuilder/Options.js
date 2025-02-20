import _ from 'lodash';
import ih from 'immutability-helper';
import { useState, useCallback } from 'react';
import { DndContext } from '@dnd-kit/core';

import { dragAndDrop } from '@openagenda/react-shared';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';

import labels from './lib/labels.js';
import OptionLabelsForm from './OptionLabelsForm.js';
import OptionItem from './OptionItem.js';

const {
  Droppable,
  Draggable,
  useDragAndDropSensors,
  useHandleDragEnd,
  arrayMove,
} = dragAndDrop;

const getLabel = makeLabelGetter(labels);

const modes = {
  ADDING: 0,
  EDITING: 1,
};

const Options = ({ field, value, lang, onChange }) => {
  const [mode, setMode] = useState(() => field.devInitState?.mode ?? null);
  const [editedIndex, setEditedIndex] = useState(
    () => field.devInitState?.editedIndex ?? null,
  );

  const sensors = useDragAndDropSensors();

  const getOptions = useCallback(() => value || [], [value]);

  const handleDragEnd = useHandleDragEnd('value', getOptions(), ({ from, to }) => onChange(arrayMove(getOptions(), from, to)), 'droppable-options');

  const addOption = useCallback(
    (newOption) => {
      onChange(getOptions().concat(newOption));
    },
    [getOptions, onChange],
  );

  const editOption = useCallback((index) => {
    setMode(modes.EDITING);
    setEditedIndex(index);
  }, []);

  const removeOption = useCallback(
    (index) => {
      onChange(ih(getOptions(), { $splice: [[index, 1]] }));
    },
    [getOptions, onChange],
  );

  const updateOption = useCallback(
    (index, option) => {
      const options = getOptions();
      const optionWithId = _.assign({ id: options[index].id }, option);
      onChange(_.set(options, index, optionWithId));
      setMode(null);
    },
    [getOptions, onChange],
  );

  const isOptionActionable = useCallback(
    () => ![modes.EDITING].includes(mode),
    [mode],
  );

  const isOptionDisabled = useCallback(
    (index) => {
      if (mode === modes.ADDING) return false;
      if (mode === modes.EDITING && index !== editedIndex) return true;
      return false;
    },
    [mode, editedIndex],
  );

  const renderAdd = () => {
    if (![modes.ADDING].includes(mode)) {
      return (
        <button
          type="button"
          disabled={mode !== null}
          className="btn btn-primary margin-top-md"
          onClick={() => setMode(modes.ADDING)}
        >
          {getLabel('optionAdd', lang)}
        </button>
      );
    }

    if (mode === modes.ADDING) {
      return (
        <div className="margin-top-md">
          <OptionLabelsForm
            otherOptions={getOptions()}
            onSubmit={(i, o) => addOption(o)}
            lang={lang}
            languages={
              _.isArray(field.labelLanguages) && field.labelLanguages.length
                ? field.labelLanguages
                : null
            }
          />
        </div>
      );
    }
  };

  const renderDraggableOptions = () => {
    const options = getOptions();

    return (
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <Droppable id="droppable-options" className="list-group margin-v-sm">
          {options.map((option, index) => (
            <Droppable id={option.value} className="list-group-item">
              <Draggable
                id={option.value}
                className="list-group-item-content"
              >
                <OptionItem
                  lang={lang}
                  field={field}
                  option={option}
                  otherOptions={value.filter((o, i) => i !== index)}
                  index={index}
                  isEdited={mode === modes.EDITING && index === editedIndex}
                  actionable={isOptionActionable()}
                  disabled={isOptionDisabled(index)}
                  onEdit={(i) => editOption(i)}
                  onEditCancel={() => setMode(null)}
                  onRemove={() => removeOption(index)}
                  onUpdate={(i, o) => updateOption(i, o)}
                />
              </Draggable>
            </Droppable>
          ))}
        </Droppable>
      </DndContext>
    );
  };

  const options = getOptions();

  return (
    <div className="options-field-form dnd">
      {options.length
        ? renderDraggableOptions()
        : (
          <div className="margin-top-md margin-bottom-sm text-center">
            {getLabel('emptyOptions', lang)}
          </div>
        )}
      {renderAdd()}
    </div>
  );
};

export default Options;
