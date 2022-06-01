import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import { Modal } from '@openagenda/react-shared';
import React, { Component } from 'react';

import ChooseFieldType from './ChooseFieldType';
import FieldForm from './FieldForm';
import labels from './lib/labels';

const getLabel = makeLabelGetter(labels);

export default class FieldAdd extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adding: false,
      fieldType: null
    };
  }

  onSubmit(values) {
    const {
      onAdd
    } = this.props;

    onAdd(values);

    this.close();
  }

  onShowChooseTypeMenu() {
    this.setState({
      adding: true,
      fieldType: null
    });
  }

  onChooseType(chosenType) {
    this.setState({
      adding: true,
      fieldType: chosenType
    });
  }

  close() {
    this.setState({
      adding: false
    });
  }

  renderFieldForm() {
    const {
      lang,
      labelLanguages
    } = this.props;

    const fieldType = this.state?.fieldType ?? null;

    return (
      <FieldForm
        initFieldType={fieldType}
        onSubmit={values => this.onSubmit(values)}
        lang={lang}
        labelLanguages={labelLanguages}
        actionComponent={({ onSubmit }) => (
          <div>
            <button
              type="button"
              className="btn btn-default"
              onClick={this.close.bind(this)}
            >
              {getLabel('cancelFieldEdit', lang)}
            </button>
            <button
              type="button"
              className="btn btn-primary pull-right"
              onClick={onSubmit}
            >
              {getLabel('confirmFieldCreate', lang)}
            </button>
          </div>
        )}
      />
    );
  }

  render() {
    const { lang, disabled } = this.props;
    const {
      adding,
      fieldType
    } = this.state;

    if (disabled) {
      return (
        <button
          type="button"
          disabled
          className="btn btn-primary"
        >
          {getLabel('addField', lang)}
        </button>
      );
    }

    if (!adding) {
      return (
        <div className="text-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.onShowChooseTypeMenu.bind(this)}
          >
            {getLabel('addField', lang)}
          </button>
        </div>
      );
    }

    return (
      <Modal
        classNames={{ overlay: 'popup-overlay big' }}
        onClose={() => this.close()}
      >
        <h3 className="margin-bottom-md">{getLabel('addField', lang)}</h3>
        { fieldType ? this.renderFieldForm() : (
          <ChooseFieldType
            lang={lang}
            onChooseType={type => this.onChooseType(type)}
            onCancel={() => this.close()}
          />
        )}
      </Modal>
    );
  }
}
