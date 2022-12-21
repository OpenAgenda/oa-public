import Accordion from '@openagenda/react-shared/lib/components/Accordion';

import Head from './Head';
import Content from './Content';

export default function FieldPreview(props) {
  const {
    onAccordionToggle,
    active,
    schema,
  } = props;

  return (
    <div className="field-preview">
      <Accordion
        head={(<Head {...props} />)}
        content={(<Content {...props} />)}
        onToggle={onAccordionToggle}
        active={active}
        schema={schema}
      />
    </div>
  );
}
