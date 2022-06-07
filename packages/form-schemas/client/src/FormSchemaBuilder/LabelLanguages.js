import _ from 'lodash';
import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import { Modal } from '@openagenda/react-shared';

import Languages from '../Components/Languages';
import labels from './lib/labels';

const getLabel = makeLabelGetter(labels);

export default class LabelLanguages extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editedLanguages: null
    };
  }

  onEdit(e) {
    e.preventDefault();

    const {
      labelLanguages
    } = this.props;

    this.setState({
      editedLanguages: labelLanguages
    });
  }

  applyLanguages(languages = []) {
    const {
      onUpdate
    } = this.props;

    onUpdate(languages);

    this.setState({
      editedLanguages: null
    });
  }

  renderEdit() {
    const { lang } = this.props;

    const { editedLanguages } = this.state;

    return (
      <div>
        {editedLanguages.length
          ? (
            <div>
              <p>{getLabel('editLabelLanguagesInfo', lang)}</p>
              <Languages
                className="language-bar thin"
                lang={lang}
                value={editedLanguages}
                onChange={editedLanguagesUpdate => this.setState({
                  editedLanguages: editedLanguagesUpdate
                })}
              />
              <div className="padding-top-md">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => this.applyLanguages(editedLanguages)}
                >
                  {getLabel('submitLabelLanguages', lang)}
                </button>
                <button
                  type="button"
                  className="btn btn-danger pull-right"
                  onClick={() => this.applyLanguages()}
                >{getLabel('removeLabelLanguages', lang)}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p>{getLabel('monolingualLabels', lang)}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => this.setState({ editedLanguages: [lang] })}
              >
                {getLabel('addLabelLanguages', lang)}
              </button>
            </div>
          )}
      </div>
    );
  }

  render() {
    const { labelLanguages, lang, disabled } = this.props;
    const { editedLanguages } = this.state;
    return (
      <div>
        <div>
          {disabled ? (
            <button
              type="button"
              disabled
              className="btn btn-link pull-right"
            >
              {getLabel('editLabelLanguages', lang)}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-link pull-right"
              onClick={this.onEdit.bind(this)}
            >
              {getLabel('editLabelLanguages', lang)}
            </button>
          )}
          <label
            htmlFor="language-list"
            className="margin-right-sm margin-top-xs"
          >
            {getLabel('multilingualLabels', lang)}
          </label>
          <div className="margin-v-xs" id="language-list">
            {labelLanguages.length ? labelLanguages.map(l => (
              <span key={`field-lang-${l}`} className="badge badge-default margin-right-xs">{_.toUpper(l)}</span>
            )) : <span>{getLabel('monolingualLabels', lang)}</span>}
          </div>
        </div>
        {editedLanguages ? (
          <Modal
            title={getLabel('editLabelLanguages', lang)}
            onClose={() => this.setState({ editedLanguages: null })}
          >
            {this.renderEdit()}
          </Modal>
        ) : null}
      </div>
    );
  }
}
