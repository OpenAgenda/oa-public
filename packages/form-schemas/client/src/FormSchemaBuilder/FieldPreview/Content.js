import getFieldTypeLabel from '../lib/getFieldTypeLabel';

import {
  isFieldLinked,
  isFieldMultilingual,
  isFieldDisplayed,
  isFieldEditable,
  isFieldOptional,
  getLabel,
  getDefaultValueLabel,
  getFieldTypeIcon,
} from './utils';

import {
  getSummary as getLinkedFieldSummaryLabel,
  getDetailed as getLinkedFieldDetailedLabel,
} from './linkedFieldLabels';

function renderToggleRemove(props) {
  const {
    isDisabled,
    onRemove,
    lang,
    field,
  } = props;
  return (
    isFieldDisplayed(field) ? (
      <button
        type="button"
        onClick={() => (isDisabled ? null : onRemove())}
        className="btn btn-link"
      >
        <span className="text-danger">{getLabel('removeField', lang)}</span>
      </button>
    ) : null
  );
}

function renderToggleHidden(props) {
  const {
    field,
    onShow,
    onHide,
    lang,
  } = props;

  return (
    isFieldDisplayed(field) ? (
      <button
        type="button"
        onClick={() => onHide()}
        className="btn btn-link"
      >
        {getLabel('hideField', lang)}
      </button>
    ) : (
      <button
        type="button"
        name={`show-${field.field}`}
        className="btn btn-link"
        onClick={() => onShow()}
      >
        {getLabel('showField', lang)}
      </button>
    )
  );
}

function getInfoLabel(props) {
  const {
    editable,
    lang,
    disabled,
  } = props;
  if (!editable) {
    return getLabel('uneditableFieldInfo', lang);
  }
  if (disabled) {
    return null;
  }
  return getLabel('editFieldInfo', lang);
}

export default function Content(props) {
  const {
    field,
    lang,
    schema,
    ordering,
    editableExtensions,
    isOwn,
    disabled,
    onEdit,
  } = props;

  const {
    has: hasIcon,
    className: iconClassName,
  } = getFieldTypeIcon(field);

  const editable = isFieldEditable(field, { isOwn, editableExtensions });

  const isDisabled = !editable || disabled;

  return (
    <>
      <div className="margin-top-xs">
        {isFieldOptional(field) ? null
          : (
            <span className="form-icon margin-right-sm">
              <i className="obligatoire" />
              <span className="optional">{getLabel('requiredField', lang)}</span>
            </span>
          )}
        {isFieldDisplayed(field) ? null
          : (
            <span className="form-icon margin-right-sm">
              <i className="hidden-field" />
              <span className="optional">{getLabel('hiddenField', lang)}</span>
            </span>
          )}
        {field.fieldType ? (
          <span className="form-icon margin-right-sm">
            {hasIcon ? <i className={iconClassName} /> : null}
            <span className="fieldtype">{getFieldTypeLabel(field, lang)}</span>
          </span>
        ) : null }
        {isFieldMultilingual(field) ? (
          <span className="form-icon margin-right-sm">
            <i className="languages" />
            <span className="multilingual-label">{getLabel('isMultilingual', lang)}</span>
          </span>
        ) : null}
        {isFieldLinked(field) ? (
          <>
            <span className="form-tooltip-icon icon-hide form-icon">
              <i className="linked" />
              <div className="tooltip right" role="tooltip">
                <div className="tooltip-arrow"> </div>
                <div className="tooltip-inner">{getLinkedFieldDetailedLabel({ field, lang, schema })}</div>
              </div>
            </span>
            <span className="linked-label">{getLinkedFieldSummaryLabel({ field, lang, schema })}</span>
          </>
        ) : null}
      </div>
      {field.field ? (
        <div className="margin-top-xs" title={getLabel('jsonKey', lang)}>{getLabel('jsonKey', lang)}: {field.field}</div>
      ) : null }
      {'default' in field ? (
        <div className="margin-top-xs" title={getLabel('defaultValue', lang)}>{getLabel('defaultValue', lang)} : {getDefaultValueLabel(field, lang)}</div>
      ) : null }
      {field.max ? (
        <div className="margin-top-xs" title={getLabel('maxLength', lang)}>{getLabel('maxLength', lang)}: {field.max}</div>
      ) : null }
      {ordering ? (
        <ul className="form-item-actions list-inline">
          <li><span className="btn btn-link">{getLabel('orderField', lang)}</span></li>
        </ul>
      ) : (
        <div className="form-item-actions padding-h-xs">
          {isFieldDisplayed(field) ? (
            <button
              type="button"
              name={`edit-${field.field}`}
              title={getInfoLabel(props)}
              onClick={() => (!isDisabled ? onEdit() : null)}
              className="btn btn-link"
              disabled={!editable || disabled}
            >
              {getLabel('editField', lang)}
            </button>
          ) : null}
          {isFieldOptional(field) ? renderToggleHidden(props) : null}
          {isOwn ? renderToggleRemove(props) : null}
        </div>
      )}
    </>
  );
}
