"use strict";

import React, { Component } from 'react';

import labels from '@openagenda/labels/agenda-contribute/canvas';

import Stepper from './Stepper';

export default class Canvas extends Component {

  componentDidMount() {

    if ( this.props.onDidMount ) {

      this.props.onDidMount( this.props.step );

    }

  }

  render() {

    const { lang, children, step, member } = this.props;

    return <div className="container">
      <div className="row">
        <div className="col-sm-offset-2 col-sm-8 col-lg-offset-3 col-lg-6 margin-bottom-lg">
          <div className="text-center padding-top-lg">
            <h2 className="margin-top-md">{labels.addEvent[lang]}</h2>
            <div className="padding-h-md stepper-gray-background padding-v-md">
              <Stepper step={step} lang={lang} displayMemberStep={member.dataIsRequired}/>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>

  }

}
