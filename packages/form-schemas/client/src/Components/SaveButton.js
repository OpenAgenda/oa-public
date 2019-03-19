import React, { Component } from 'react';
import Spinner from '@openagenda/react-components/build/Spinner';
import classNames from 'classnames';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from '../lib/builderLabels';
import saveStates from '../lib/saveStates';

const getLabel = makeLabelGetter( labels );

export default ( { saveState, lang, onClick, disabled, block } ) => {

  const buttonClasses = classNames( {
    btn: true,
    'btn-success' : saveState === saveStates.SAVED,
    'btn-primary' : saveState !== saveStates.SAVED,
    'btn-block' : block
  } );

  if ( saveState === saveStates.SAVED ) {

    return <div className="form-inline">
      <button disabled className={buttonClasses}>{getLabel( 'buttonSaved', lang )}</button>
    </div>

  } else if ( saveState === saveStates.LOADING ) {

    return <div className="form-inline">
      <button disabled className={buttonClasses}>
        <span>{getLabel( 'buttonSave', lang )}</span>
      </button>
      <Spinner page={true} />
    </div>

  } else if ( !disabled && saveState === saveStates.CHANGED ) {

    return <div className="form-inline">
      <button
        id="save"
        className={buttonClasses}
        onClick={onClick}
      >{getLabel( 'buttonSave', lang )}</button>
    </div>

  } else if ( !disabled && saveState === saveStates.ERROR ) {

    return <div className="form-inline has-error">
      <button
        className={buttonClasses}
        onClick={onClick}
      >{getLabel( 'buttonSave', lang )}</button>
      <label className="control-label" htmlFor="save">{getLabel( 'buttonError', lang )}</label>
    </div>

  }

  return <div>
    <button disabled className={buttonClasses}>{getLabel( 'buttonSave', lang )}</button>
  </div>

}
