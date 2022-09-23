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
      fieldType: null
    };
  }

  onSubmit(values) {
    const {
      onAdd
    } = this.props;

    onAdd(values);
  }

  onShowChooseTypeMenu() {
    this.setState({
      fieldType: null
    });
  }

  onChooseType(chosenType) {
    this.setState({
      fieldType: chosenType
    });
  }

  renderFieldForm() {
    const {
      lang,
      labelLanguages,
      onClose
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
              onClick={() => onClose()}
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
    const {
      lang,
      onClose
    } = this.props;

    const {
      fieldType
    } = this.state;

    return (
      <Modal
        classNames={{ overlay: 'popup-overlay big' }}
        onClose={() => onClose()}
      >
        <h3 className="margin-bottom-md">{getLabel('addField', lang)}</h3>
        {fieldType ? this.renderFieldForm() : (
          <ChooseFieldType
            lang={lang}
            onChooseType={type => this.onChooseType(type)}
            onCancel={() => onClose()}
          />
        )}
      </Modal>
    );
  }
}
