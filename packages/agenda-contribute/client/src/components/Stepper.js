"use strict";

import React from 'react';
import classNames from 'classnames';

import labels from '@openagenda/labels/agenda-contribute/stepper';

export default ( { steps, lang, onSelectStep } ) => <div className="stepper-container">
  <div className="stepper">{steps.filter( s => s.display ).map( s => <div 
    key={s.step}
    onClick={() => s.activable ? onSelectStep( s.step ) : null}
    className={classNames( { step: true, active: s.active, activable: s.activable } )}>
    {labels[ s.step ][ lang ]}
  </div> )}</div>  
</div>
