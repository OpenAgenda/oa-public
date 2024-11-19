import { Accordion } from '@openagenda/react-shared';

import Head from './Head.js';
import Content from './Content.js';

export default function FieldPreview(props) {
  const { onAccordionToggle, active, schema } = props;

  return (
    <div className="field-preview">
      <Accordion
        head={<Head {...props} />}
        content={<Content {...props} />}
        onToggle={onAccordionToggle}
        active={active}
        schema={schema}
      />
    </div>
  );
}
