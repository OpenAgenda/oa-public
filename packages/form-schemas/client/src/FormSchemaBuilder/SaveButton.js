import React from 'react';
import { Spinner } from '@openagenda/react-shared';
import classNames from 'classnames';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from './lib/labels';
import saveStates from './lib/saveStates';

const getLabel = makeLabelGetter(labels);

export default ({ saveState, lang, onClick, disabled, block }) => {
  const buttonClasses = classNames({
    btn: true,
    'btn-success': saveState === saveStates.SAVED,
    'btn-primary': saveState !== saveStates.SAVED,
    'btn-block': block,
    'pull-right': true,
  });

  if (saveState === saveStates.SAVED) {
    return (
      <button type="button" disabled className={buttonClasses}>{getLabel('buttonSaved', lang)}</button>
    );
  } if (saveState === saveStates.LOADING) {
    return (
      <>
        <button type="button" disabled className={buttonClasses}>
          <span>{getLabel('buttonSave', lang)}</span>
        </button>
        <Spinner page />
      </>
    );
  } if (!disabled && saveState === saveStates.CHANGED) {
    return (
      <button
        type="button"
        id="save"
        className={buttonClasses}
        onClick={onClick}
      >{getLabel('buttonSave', lang)}
      </button>
    );
  } if (!disabled && saveState === saveStates.ERROR) {
    return (
      <>
        <button
          type="button"
          className={buttonClasses}
          onClick={onClick}
        >{getLabel('buttonSave', lang)}
        </button>
        <label className="control-label" htmlFor="save">{getLabel('buttonError', lang)}</label>
      </>
    );
  }

  return (
    <button type="button" disabled className={buttonClasses}>{getLabel('buttonSave', lang)}</button>
  );
};
