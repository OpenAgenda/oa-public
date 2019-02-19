import React, { Component } from 'react';
import Spinner from '@openagenda/react-components/build/Spinner';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from '../lib/builderLabels';
import saveStates from '../lib/saveStates';

const getLabel = makeLabelGetter( labels );

export default ( { saveState, lang, onClick } ) => {

  if ( saveState === saveStates.SAVED ) {

    return <div className="form-inline">
      <button disabled className="btn btn-success">{getLabel( 'buttonSaved', lang )}</button>
    </div>

  } else if ( saveState === saveStates.LOADING ) {

    return <div className="form-inline">
      <button disabled className="btn btn-primary margin-right-sm">{getLabel( 'buttonSave', lang )}</button>
      <Spinner mode="inline"/>
    </div>

  } else if ( saveState === saveStates.CHANGED ) {

    return <div className="form-inline">
      <button
        id="save"
        className="btn btn-primary"
        onClick={onClick}
      >{getLabel( 'buttonSave', lang )}</button>
    </div>

  } else if ( saveState === saveStates.ERROR ) {

    return <div className="form-inline has-error">
      <button
        className="btn btn-primary margin-right-sm"
        onClick={onClick}
      >{getLabel( 'buttonSave', lang )}</button>
      <label className="control-label" htmlFor="save">{getLabel( 'buttonError', lang )}</label>
    </div>

  }

  return <div>
    <button disabled className="btn btn-primary">{getLabel( 'buttonSave', lang )}</button>
  </div>

}
