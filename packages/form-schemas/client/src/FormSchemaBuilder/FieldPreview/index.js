import classNames from 'classnames';
import Accordion from '@openagenda/react-shared/lib/components/Accordion';

import Head from './Head';
import Content from './Content';

export default function FieldPreview(props) {
  const {
    onAccordionToggle,
    active,
    schema,
    field,
  } = props;

  if (field.type === 'section' || field.fieldType === 'languages') {
    return (
      <div className="margin-v-sm">
        <Head
          {...props}
        />
      </div>
    );
  }

  return (
    <div
      className={classNames({
        'field-preview': true,
      })}
    >
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
