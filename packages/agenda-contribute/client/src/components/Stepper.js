"use strict";

import React from 'react';
import classNames from 'classnames';

import labels from '@openagenda/labels/agenda-contribute/stepper';

export default ( { step, lang, displayMemberStep } ) => <div className="stepper-container">
  <div className="stepper">
    { displayMemberStep ? <div className={classNames({ step: true, active: step==='member' })}>{labels.member[ lang ]}</div> : null }
    <div className={classNames({ step: true, active: step==='event' })}>{labels.event[ lang ]}</div>
    <div className={classNames({ step: true, active: step==='confirmation' })}>{labels.confirmation[ lang ]}</div>
  </div>
</div>