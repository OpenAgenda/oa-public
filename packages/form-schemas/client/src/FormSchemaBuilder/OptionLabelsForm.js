import _ from 'lodash';
import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import FormSchemaComponent from '..';

import slugFromLabel from './lib/slugFromLabel';
import labels from './lib/labels';

const focusOnFirstInput = () => {
  try {
    document.querySelector('.js_add_option_input input').focus();
  } catch (e) {
    console.log(e);
  }
};

const getLabel = makeLabelGetter(labels);

export default class OptionAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option: this.isEdit() ? {
        label: props.option.label
      } : {},
      error: null
    };
  }

  onChange({ values, errors }) {
    this.setState({
      option: values,
      error: errors.length ? this.getErrorLabel(_.first(errors).code) : null
    });
  }

  onSubmit() {
    const {
      error
    } = this.state;

    const {
      lang,
      otherOptions,
      onSubmit
    } = this.props;

    if (error) return;

    const optionLabel = _.get(this, 'state.option.label');

    const isEmpty = !optionLabel || (
      _.isString(optionLabel) ? !optionLabel.length
        : _.keys(optionLabel).filter(k => _.isString(optionLabel[k]) && optionLabel[k].length).length !== _.keys(optionLabel).length
    );

    // add option must be unique
    const option = isEmpty ? null : {
      value: slugFromLabel(optionLabel, lang),
      label: optionLabel
    };

    if (isEmpty) {
      this.setState({
        error: this.getErrorLabel('optionEmpty')
      });
    } else if (otherOptions.filter(o => o.value === option.value).length) {
      this.setState({
        error: this.getErrorLabel('optionDuplicate')
      });
    } else {
      onSubmit(option);

      this.setState({
        option: null,
        error: null
      });

      focusOnFirstInput();
    }
  }

  getErrorLabel(errorCode) {
    const {
      lang
    } = this.props;

    if (labels[`${errorCode}Error`]) {
      return getLabel(`${errorCode}Error`, lang);
    }

    return errorCode;
  }

  isEdit() {
    const {
      option
    } = this.props;
    return !!option;
  }

  render() {
    const {
      languages,
      lang,
      onCancel
    } = this.props;

    const {
      error,
      option
    } = this.state;

    return (
      <FormSchemaComponent
        stateless
        onChange={({ values, errors }) => this.onChange({ values, errors })}
        globalError={error}
        values={option}
        lang={this.lang}
        schema={{
          fields: [{
            label: this.isEdit() ? labels.optionEdit : labels.optionAdd,
            field: 'label',
            fieldType: 'text',
            languages
          }]
        }}
        classNames={{
          field: 'js_add_option_input',
          bottomErrorsCanvas: 'error margin-bottom-sm'
        }}
        actionComponents={[{
          position: 'bottom',
          Component: () => (
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => this.onSubmit()}
              >
                {getLabel(this.isEdit() ? 'optionUpdateAction' : 'optionAddAction', lang)}
              </button>
              { onCancel ? (
                <button
                  type="button"
                  className="btn btn-default pull-right"
                  onClick={() => onCancel()}
                >
                  {getLabel('optionEditCancel', lang)}
                </button>
              ) : null }
            </div>
          )
        }]}
      />
    );
  }
}
