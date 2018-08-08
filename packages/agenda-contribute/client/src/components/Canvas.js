"use strict";

import React from 'react';

import labels from '@openagenda/labels/agenda-contribute/canvas';

import Stepper from './Stepper';

export default ( { lang, children, step, member } ) => { 

  return <div className="container">
  <div className="row">
    <div className="col-lg-offset-3 col-lg-6 margin-bottom-lg">
      <div className="text-center">
        <h2 className="margin-top-lg margin-bottom-lg">{labels.addEvent[lang]}</h2>
        <div className="wsq padding-top-md padding-h-md">
          <Stepper step={step} lang={lang} displayMemberStep={member.dataIsRequired}/>
        </div>
      </div>
      {children}
    </div>
  </div>
</div> }