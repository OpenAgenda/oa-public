import _ from 'lodash';
import React, { Component } from 'react';

import labels from '@openagenda/labels/agenda-contribute/event';
import makeLabelGetter from '@openagenda/labels';

import getEventTitle from '../lib/getEventTitle';

const getLabel = makeLabelGetter(labels);

export default class Canvas extends Component {
  componentDidMount() {
    this.props.onDidMount(this.props.mode);
  }
  renderAddHeader() {
    const { event, lang, fromAgenda, agenda } = this.props;
    return <div className="margin-v-lg">
      <h3 className="margin-bottom-md">{getLabel('shareEvent', lang)}</h3>
      <div className="margin-v-md">
        <p>{getLabel('takeEvent', lang)} <strong>{getEventTitle(event, lang)}</strong></p>
        <p>{getLabel('fromAgenda', lang)} <a target="_blank" href={`/agendas/${fromAgenda.uid}`}><span>{fromAgenda.title}</span></a></p>
        <p>{getLabel('toAgenda', lang)} <a target="_blank" href={`/agendas/${agenda.uid}`}><span>{agenda.title}</span></a></p>
      </div>
    </div>
  }
  renderEditHeader() {
    const { event, lang } = this.props;
    return <div className="margin-v-lg">
      <h3>{getEventTitle(event, lang)}</h3>
    </div>
  }
  render() {
    const {
      mode,
      children
    } = this.props;
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-offset-2 col-sm-8 col-lg-offset-3 col-lg-6 margin-bottom-lg">
            <div className="text-center">
              {mode === 'add' ? this.renderAddHeader() : this.renderEditHeader()}
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}