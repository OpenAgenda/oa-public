import { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import { Modal } from '@openagenda/react-shared';

import FieldForm from './FieldForm';
import labels from './lib/labels';

const getLabel = makeLabelGetter(labels);

export default class FieldEdit extends Component {
  onSubmit(values) {
    const { onSave } = this.props;
    onSave(values);
  }

  render() {
    const {
      field,
      lang,
      labelLanguages,
      onCancel,
      customFieldConfigurationSchemas,
      components,
      parentsFields,
    } = this.props;

    return (
      <Modal classNames={{ overlay: 'popup-overlay big' }} onClose={onCancel}>
        <FieldForm
          lang={lang}
          labelLanguages={labelLanguages}
          field={field}
          onSubmit={v => this.onSubmit(v)}
          actionComponent={({ onSubmit }) => (
            <div>
              <button type="button" className="btn btn-default" onClick={onCancel}>{getLabel('cancelFieldEdit', lang)}</button>
              <button type="button" className="btn btn-primary pull-right" onClick={onSubmit}>{getLabel('confirmFieldUpdate', lang)}</button>
            </div>
          )}
          customFieldConfigurationSchemas={customFieldConfigurationSchemas}
          components={components}
          parentsField={parentsFields.fields.find(e => e.field === field.field)}
        />
      </Modal>
    );
  }
}
