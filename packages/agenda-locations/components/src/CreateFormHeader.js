import React, { Component } from 'react';
import PropTypes from 'prop-types';
import utils from '@openagenda/utils';
import createLabels from '@openagenda/labels/agenda-locations/create';
import formLabels from '@openagenda/labels/agenda-locations/form';
import makeLabelGetter from '@openagenda/labels';

const getLabel = makeLabelGetter(utils.extend({}, formLabels, createLabels));


class CreateFormHeader extends Component {
  static propTypes = {
    lang: PropTypes.string.isRequired,
    actions: PropTypes.object,
    settings: PropTypes.object,
  }

  getLabel(name) {
    let str;
    const { settings, lang } = this.props;

    if (
      settings
      && settings.labels
      && settings.labels.create
      && settings.labels.create[name]
    ) {
      str = settings.labels.create[name][lang];
    } else {
      str = getLabel(name, lang);
    }

    return str;
  }

  render() {
    const { actions, lang } = this.props;
    return (
      <div className="head">
        {actions && actions.closeForm ? (
          <a className="btn btn-default" onClick={actions.closeForm}>
            <i className="fa fa-angle-left margin-right-sm" />
            <span>{this.getLabel('back')}</span>
          </a>
        ) : null}
        <h2>{this.getLabel('title', lang)}</h2>
        <span className="info">{this.getLabel('info', lang)}</span>
      </div>
    );
  }
}

export default CreateFormHeader;
