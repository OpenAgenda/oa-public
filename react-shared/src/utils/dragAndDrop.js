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

export function Droppable({ id, children, className = '', disabled = false }) {
  const { isOver, setNodeRef } = useDroppable({ id, disabled });
  const style = {
    opacity: isOver ? '0.8' : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children}
    </div>
  );
}

export function Draggable({ id, children, className = '', disabled = false }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled,
  });
  const style = className === ''
    ? {
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
      border: 'none',
      background: 'inherit',
      margin: 0,
      padding: 0,
      display: 'flex',
    }
    : {
      display: 'flex',
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    };

  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
    <div onMouseDown={(e) => e.stopPropagation()}>
      <div
        /* type="button" */
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={className}
      >
        {children}
      </div>
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

export function useHandleDragEnd(key, items, onChange, containerId) {
  return useCallback(
    (event) => {
      const {
        over: { id: overItemId },
        active: { id: draggedItemId },
      } = event;

      const to = overItemId === containerId
        ? items.length
        : items.findIndex((option) => option[key] === overItemId);
      const from = items.findIndex((option) => option[key] === draggedItemId);

      return onChange({ from, to });
    },
    [items, onChange, key, containerId],
  );
}

export default {
  Droppable,
  Draggable,
  arrayMove,
  useDragAndDropSensors,
  useHandleDragEnd,
};
