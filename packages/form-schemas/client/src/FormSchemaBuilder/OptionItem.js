import classNames from 'classnames';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import getPreferredLang from './lib/getPreferredLang';
import labels from './lib/labels';
import OptionLabelsForm from './OptionLabelsForm';

const getLabel = makeLabelGetter(labels);
const portal = typeof document !== 'undefined' ? document.createElement('div') : null;

if (typeof document !== 'undefined') {
  if (!document.body) throw new Error('body not ready for portal creation!');
  document.body.appendChild(portal);
}

export default class OptionItem extends Component {
  renderEdit() {
    const {
      field,
      lang,
      index,
      option,
      otherOptions,
      onUpdate,
      onEditCancel
    } = this.props;

    return (
      <OptionLabelsForm
        index={index}
        option={option}
        otherOptions={otherOptions}
        onSubmit={onUpdate}
        onCancel={onEditCancel}
        lang={lang}
        languages={field.labelLanguages}
      />
    );
  }

  render() {
    const {
      option,
      isEdited,
      actionable,
      disabled,
      lang,
      provided,
      snapshot,
      onEdit,
      onRemove,
      index
    } = this.props;

    const child = (
      <li
        className={classNames({
          'list-group-item': true,
          disabled
        })}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={provided.draggableProps.style}
      >{
          isEdited ? this.renderEdit() : (
            <div>
              <label
                htmlFor={`option-${option.id}`}
                className="margin-v-xs"
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
                  <span className="text text-danger">{getLabel('optionRemove', lang)}</span>
                </button>
              </div>
            </div>
          )
        }
      </li>
    );

    return snapshot.isDragging ? ReactDOM.createPortal(child, portal) : child;
  }
}
