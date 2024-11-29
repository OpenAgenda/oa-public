import { useMemo, useCallback } from 'react';
import {
  DndContext,
  useDroppable,
  useDraggable,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import Select, { components } from 'react-select';
import { useIntl } from 'react-intl';
import defaultSelectStyles from '../utils/defaultSelectStyles.js';

function Droppable({ id, children }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const style = {
    opacity: isOver ? '0.8' : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}

function Draggable({ id, children }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    border: 'none',
    background: 'inherit',
    margin: 0,
    padding: 0,
    display: 'flex',
  };

  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
    <div onMouseDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
      >
        {children}
      </button>
    </div>
  );
}

function arrayMove(arr, from, to) {
  const slicedArray = arr.slice();
  slicedArray.splice(
    to < 0 ? arr.length + to : to,
    0,
    slicedArray.splice(from, 1)[0],
  );
  return slicedArray;
}

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

export default function FilterSelect({
  schema,
  value,
  onChange,
  exclude,
  placeholder,
  disabled = false,
  menuPosition = 'absolute',
  getFilterOptions,
}) {
  const intl = useIntl();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const filterOptions = useMemo(
    () => getFilterOptions(intl, schema, exclude),
    [intl, schema, exclude],
  );

  const selectedOptions = useMemo(
    () =>
      value
        .map((name) => filterOptions.find((o) => o.value === name))
        .filter((v) => !!v),
    [value, filterOptions],
  );

  const handleDragEnd = useCallback(
    (event) => {
      const {
        over: { id: overOptionValue },
        active: { id: draggedOptionValue },
      } = event;

      const to = overOptionValue === 'select'
        ? selectedOptions.length
        : selectedOptions.findIndex(
          (option) => option.value === overOptionValue,
        );
      const from = selectedOptions.findIndex(
        (option) => option.value === draggedOptionValue,
      );

      onChange(arrayMove(selectedOptions, from, to).map((o) => o.value));
    },
    [selectedOptions, onChange],
  );

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <Select
        value={selectedOptions}
        onChange={(update) => {
          onChange(update.map((o) => o.value));
        }}
        options={filterOptions}
        isMulti
        closeMenuOnSelect
        /* openMenuOnClick={false} */
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
