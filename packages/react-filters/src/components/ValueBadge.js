import React from 'react';
import getLocaleValue from '../utils/getLocaleValue';

export default function ValueBadge({ label, onRemove, disabled }) {
  return (
    <div className="badge badge-info">
      {getLocaleValue(label)}
      <button
        type="button"
        className="btn btn-link btn-link-inline margin-left-xs"
        disabled={disabled}
        onClick={onRemove}
      >
        <i className="fa fa-times" aria-hidden="true" />
      </button>
    </div>
  );
}
