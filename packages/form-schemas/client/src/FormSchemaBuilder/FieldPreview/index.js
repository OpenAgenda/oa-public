import { Accordion } from '@openagenda/react-shared';
import { useSortable } from '@dnd-kit/react/sortable';
import Head from './Head.js';
import Content from './Content.js';

export default function FieldPreview(props) {
  const { onAccordionToggle, active, schema, field, disabled, index } = props;
  const { ref } = useSortable({ id: field.field, index });
  return (
    <div
      ref={ref}
      className={`list-group-item draggable ${disabled ? 'disabled' : ''} `}
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
