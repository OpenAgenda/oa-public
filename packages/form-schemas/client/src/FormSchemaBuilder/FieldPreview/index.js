import { Accordion } from '@openagenda/react-shared';
import { useSortable } from '@dnd-kit/sortable';
import Head from './Head.js';
import Content from './Content.js';

export default function FieldPreview(props) {
  const { onAccordionToggle, active, schema, field, disabled } = props;

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.field });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: transition || 'transform 200ms ease',
  };

  return (
    <div
      ref={setNodeRef}
      className={`list-group-item draggable ${disabled ? 'disabled' : ''}`}
      style={style}
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
