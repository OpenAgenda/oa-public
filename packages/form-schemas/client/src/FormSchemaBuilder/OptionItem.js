import { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over,
  } = useSortable({ id: option.value, disabled: disableDnD });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 100 : 'auto',
  };

  const child = (
    <div
      className="list-group-item draggable"
      ref={setNodeRef}
      style={isDragging || over ? style : null}
      {...attributes}
      {...listeners}
    >
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
