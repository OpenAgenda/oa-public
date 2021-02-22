import _ from 'lodash';
import React, { Component } from 'react';

import labels from '@openagenda/labels/agenda-contribute/event';
import makeLabelGetter from '@openagenda/labels';

const getLabel = makeLabelGetter(labels);

const renderTitle = (event, lang) => {
  const titleLanguages = Object.keys(event.title || {});

  const eventLanguage = titleLanguages.includes(lang) ? lang : titleLanguages.shift();

  const title = [];

  if (event.draft) {
    title.push(labels.editDraftTitle[lang]);
  }

  if (eventLanguage) {
    title.push(event.title[eventLanguage]);
  }

  return title.join(': ');
}

export default class Canvas extends Component {
  componentDidMount() {
    this.props.onDidMount(this.props.mode);
  }
  renderAddHeader() {
    const { event, lang, fromAgenda, agenda } = this.props;
    return <div className="margin-v-lg">
      <h3 class="margin-bottom-md">{getLabel('shareEvent', lang)}</h3>
      <div className="margin-v-md">
        <p>{getLabel('takeEvent', lang)} <strong>{renderTitle(event, lang)}</strong></p>
        <p>{getLabel('fromAgenda', lang)} <a target="_blank" href={`/agendas/${fromAgenda.uid}`}><span>{fromAgenda.title}</span></a></p>
        <p>{getLabel('toAgenda', lang)} <a target="_blank" href={`/agendas/${agenda.uid}`}><span>{agenda.title}</span></a></p>
      </div>
    </div>
  }
  renderEditHeader() {
    const { event, lang } = this.props;
    return <div className="margin-v-lg">
      <h3>{renderTitle(event, lang)}</h3>
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