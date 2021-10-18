import React from 'react';
import classNames from 'classnames';
import {
  defineMessages,
  useIntl
} from 'react-intl';

const messages = defineMessages({
  member: {
    id: 'AgendaContribute.Stepper.member',
    defaultMessage: 'Member form'
  },
  event: {
    id: 'AgendaContribute.Stepper.event',
    defaultMessage: 'My event'
  },
  confirmation: {
    id: 'AgendaContribute.Stepper.confirmation',
    defaultMessage: 'Confirmation'
  }
});

export default ({
  steps,
  onSelectStep
}) => {
  const onSelect = s => (s.activable ? onSelectStep(s.step) : null);

  const m = useIntl().formatMessage;

  return (
    <div className="stepper-container">
      <div id="stepper" className="stepper">{steps.filter(s => s.display).map((s, i) => (
        <div
          role="button"
          tabIndex={i}
          onKeyDown={() => onSelect(s)}
          key={s.step}
          onClick={() => onSelect(s)}
          className={classNames({
            step: true,
            active: s.active,
            activable: s.activable
          })}
        >
          {m(messages[s.step])}
        </div>
      ))}
      </div>
    </div>
  );
};
