import { useCallback } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';

import getPreferredLang from './lib/getPreferredLang.js';
import labels from './lib/labels.js';
import OptionLabelsForm from './OptionLabelsForm.js';

const getLabel = makeLabelGetter(labels);
const portal = typeof document !== 'undefined' ? document.createElement('div') : null;

if (typeof document !== 'undefined') {
  if (!document.body) throw new Error('body not ready for portal creation!');
  document.body.appendChild(portal);
}

const OptionItem = ({
  field,
  lang,
  index,
  option,
  otherOptions,
  onUpdate,
  onEditCancel,
  isEdited,
  actionable,
  onEdit,
  onRemove,
}) => {
  const renderEdit = useCallback(
    () => (
      <OptionLabelsForm
        index={index}
        option={option}
        otherOptions={otherOptions}
        onSubmit={onUpdate}
        onCancel={onEditCancel}
        lang={lang}
        languages={field.labelLanguages}
      />
    ),
    [
      field.labelLanguages,
      index,
      lang,
      onEditCancel,
      onUpdate,
      option,
      otherOptions,
    ],
  );

  const child = (
    <>
      {isEdited
        ? renderEdit()
        : (
          <div>
            <label htmlFor={`option-${option.id}`} className="margin-v-xs text-left">
              {getPreferredLang(option.label, lang)}
            </label>
            <div className="form-item-actions padding-h-xs">
              <button
                type="button"
                id={`option-${option.id}`}
                disabled={!actionable}
                onClick={() => onEdit(index)}
                className="btn btn-link"
              >
                {getLabel('optionEdit', lang)}
              </button>
              <button
                type="button"
                disabled={!actionable}
                onClick={onRemove}
                className="btn btn-link"
              >
                <span className="text text-danger">
                  {getLabel('optionRemove', lang)}
                </span>
              </button>
            </div>
          </div>
        )}
    </>
  );

  return child;
};

export default OptionItem;
