import _ from 'lodash';

import React, { Component } from 'react';

import labels from '@openagenda/labels/agenda-contribute/event';

import Stepper from './Stepper';

export default class Canvas extends Component {

  componentDidMount() {

    if ( this.props.onDidMount ) {

      this.props.onDidMount( _.first( this.props.steps.filter( s => s.active ) ) );

    }

  }

  renderTitle() {

    const { event, lang, title } = this.props;

    if ( title ) return title;

    const draft = _.get( event, 'draft', false );

    if ( !draft ) return labels.addEvent[ lang ];

    const titleLanguages = _.keys( event.title );

    const eventLanguage = titleLanguages.includes( lang ) ? lang : _.first( titleLanguages );

    const titleParts = [];

    if ( event.draft ) titleParts.push( labels.editDraftTitle[ lang ] );

    if ( eventLanguage ) titleParts.push( _.get( event, [ 'title', eventLanguage ] ) );

    return titleParts.join( ': ' )

  }

  render() {

    const { lang, children, steps, onSelectStep } = this.props;

    return <div className="container">
      <div className="row">
        <div className="col-sm-offset-2 col-sm-8 col-lg-offset-3 col-lg-6 margin-bottom-lg">
          <div className="text-center padding-top-lg">
            <h2 className="margin-top-md">{this.renderTitle()}</h2>
            <div className="padding-h-md stepper-gray-background padding-v-md">
              <Stepper steps={steps} lang={lang} onSelectStep={onSelectStep} />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>

  }

}
