import { useCallback } from 'react';
import {
  useDroppable,
  useDraggable,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

export function Droppable({ id, children }) {
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

export function Draggable({ id, children }) {
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

export function arrayMove(arr, from, to) {
  const slicedArray = arr.slice();
  slicedArray.splice(
    to < 0 ? arr.length + to : to,
    0,
    slicedArray.splice(from, 1)[0],
  );
  return slicedArray;
}

export function useDragAndDropSensors() {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);

  return useSensors(mouseSensor, touchSensor, keyboardSensor);
}

export function useHandleDragEnd(selectedOptions, onChange) {
  return useCallback(
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
}

export default {
  Droppable,
  Draggable,
  arrayMove,
  useDragAndDropSensors,
  useHandleDragEnd,
};
