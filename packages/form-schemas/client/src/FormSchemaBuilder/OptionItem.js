import { useCallback } from 'react';
import { useSortable } from '@dnd-kit/react/sortable';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';

import getPreferredLang from './lib/getPreferredLang.js';
import labels from './lib/labels.js';
import OptionLabelsForm from './OptionLabelsForm.js';

const getLabel = makeLabelGetter(labels);

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
  disableDnD,
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
  const { ref } = useSortable({
    id: option.value,
    index,
    disabled: disableDnD,
  });
  const child = (
    <div className="list-group-item draggable" ref={ref}>
      <div className="list-group-item-content draggable">
        {isEdited
          ? renderEdit()
          : (
            <div className="margin-left-sm">
              <label
                htmlFor={`option-${option.id}`}
                className="margin-v-xs text-left"
              >
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
      </div>
    </div>
  );

  return child;
};

export default OptionItem;
