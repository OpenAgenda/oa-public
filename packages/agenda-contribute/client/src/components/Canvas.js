import React, { Component } from 'react';

import labels from '@openagenda/labels/agenda-contribute/event';
import makeLabelGetter from '@openagenda/labels';

import getEventTitle from '../lib/getEventTitle';

const getLabel = makeLabelGetter(labels);

export default class Canvas extends Component {
  componentDidMount() {
    const {
      onDidMount,
      mode
    } = this.props;

    if (onDidMount) {
      onDidMount(mode);
    }
  }

  renderAddHeader() {
    const {
      event, lang, fromAgenda, agenda
    } = this.props;
    return (
      <div className="margin-v-lg">
        <h3 className="margin-bottom-md">{getLabel('shareEvent', lang)}</h3>
        <div className="margin-v-md">
          <p>{getLabel('takeEvent', lang)} <strong>{getEventTitle(event, lang)}</strong></p>
          <p>{getLabel('fromAgenda', lang)} <a rel="noreferrer" target="_blank" href={`/agendas/${fromAgenda.uid}`}><span>{fromAgenda.title}</span></a></p>
          <p>{getLabel('toAgenda', lang)} <a rel="noreferrer" target="_blank" href={`/agendas/${agenda.uid}`}><span>{agenda.title}</span></a></p>
        </div>
      </div>
    );
  }

  renderEditHeader() {
    const {
      event,
      lang
    } = this.props;

    return (
      <div className="margin-v-lg">
        <h3>{getEventTitle(event, lang)}</h3>
      </div>
    );
  }

  renderHeader() {
    const {
      mode
    } = this.props;

    if (mode === 'add') {
      return this.renderAddHeader();
    }
    if (mode === 'edit') {
      return this.renderEditHeader();
    }

    return null;
  }

  render() {
    const {
      children
    } = this.props;

    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-offset-2 col-sm-8 col-lg-offset-3 col-lg-6 margin-bottom-lg">
            <div className="text-center">
              {this.renderHeader()}
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
