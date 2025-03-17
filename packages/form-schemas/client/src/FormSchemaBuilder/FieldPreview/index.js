import { Accordion } from '@openagenda/react-shared';
import { useSortable } from '@dnd-kit/sortable';
import Head from './Head.js';
import Content from './Content.js';

export default function FieldPreview(props) {
  const { onAccordionToggle, active, schema, field, disabled } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over,
  } = useSortable({ id: field.field || field.slug });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      className={`list-group-item draggable ${disabled ? 'disabled' : ''}`}
      style={isDragging || over ? style : null}
      {...attributes}
      {...listeners}
    >
      <div
        className={`list-group-item-content draggable ${disabled ? 'disabled' : ''}`}
      >
        <div className="field-preview">
          <Accordion
            head={<Head {...props} />}
            content={<Content {...props} />}
            onToggle={onAccordionToggle}
            active={active}
            schema={schema}
          />
        </div>
      </div>
    </div>
  );
}
