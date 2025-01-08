import { useMemo } from 'react';
import { DndContext } from '@dnd-kit/core';
import Select, { components } from 'react-select';
import defaultSelectStyles from '../utils/defaultSelectStyles.js';
import {
  Droppable,
  Draggable,
  useDragAndDropSensors,
  useHandleDragEnd,
} from '../utils/dragAndDrop.js';

function MultiValueContainer(props) {
  const {
    innerProps,
    data: { value },
  } = props;

  return (
    <Droppable id={value}>
      <Draggable id={value}>
        <components.MultiValueContainer
          {...props}
          innerProps={{ ...innerProps }}
        />
      </Draggable>
    </Droppable>
  );
}

function SelectContainer(props) {
  const { innerProps } = props;
  return (
    <Droppable id="select">
      <components.SelectContainer {...props} innerProps={{ ...innerProps }} />
    </Droppable>
  );
}

export default function SortableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  menuPosition = 'absolute',
}) {
  const sensors = useDragAndDropSensors();

  const selectableOptions = useMemo(() => options.map((option) => ({
    value: option.value,
    label: option.label,
  })), [options]);

  const selectedOptions = useMemo(
    () =>
      value
        .map((selected) => selectableOptions.find((o) => o.value === selected))
        .filter((v) => !!v),
    [value, selectableOptions],
  );

  const handleDragEnd = useHandleDragEnd(selectedOptions, onChange);

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <Select
        value={selectedOptions}
        onChange={(update) => {
          onChange(update.map((o) => o.value));
        }}
        options={selectableOptions}
        isMulti
        closeMenuOnSelect
        openMenuOnFocus
        placeholder={placeholder}
        components={{
          MultiValueContainer,
          SelectContainer,
        }}
        isDisabled={disabled}
        styles={{
          ...defaultSelectStyles,
          multiValue: (provided) => ({
            ...provided,
            margin: '1px',
            padding: '0px',
            borderRadius: '2px',
            overflow: 'hidden',
            cursor: 'grab',
          }),
        }}
        menuPosition={menuPosition}
      />
    </DndContext>
  );
}
