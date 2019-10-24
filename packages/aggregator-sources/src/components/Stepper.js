import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';

function Step({ step, onSelect }) {
  const onSelectStep = useCallback(
    e => {
      if (e.type === 'keypress' && ![' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        return;
      }

      if (step.activable) {
        onSelect(step.key);
      }
    },
    [onSelect, step.activable, step.key]
  );

  const className = useMemo(
    () => classNames('step', {
      active: step.active,
      activable: step.activable,
      passed: step.passed
    }),
    [step.activable, step.active, step.passed]
  );

  if (step.active || !step.activable) {
    return <div className={className}>{step.label}</div>;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelectStep}
      onKeyPress={onSelectStep}
      className={className}
    >
      {step.label}
    </div>
  );
}

export default function Stepper({ steps = [], onSelect }) {
  return (
    <div className="stepper-container">
      <div id="stepper" className="stepper">
        {steps
          .filter(s => s.display)
          .map(s => (
            <Step key={s.key} step={s} onSelect={onSelect} />
          ))}
      </div>
    </div>
  );
}
