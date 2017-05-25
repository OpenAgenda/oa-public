import React, { Component } from 'react';

const Field = ( {
                        content, input: { name, value }, label, subLabel, max, classNameGroup, visible = true,
                        errorOnDirty, meta: { touched, error, dirty }
                      } ) => {
  const displayError = errorOnDirty ? dirty || touched : touched;

  if ( !visible ) return <div></div>;

  return (
    <div className={`form-group ${classNameGroup} ${displayError && error ? 'has-error has-feedback' : ''}`}>
      {label && <label htmlFor={name}>{label}</label>}
      {subLabel}
      {content}
      {displayError && error && <span className="form-control-feedback">
          <i className="fa fa-times" aria-hidden="true"></i>
        </span>}
      {displayError && error && <div className={`text-danger ${max && 'pull-left' || ''}`}>
        {this.context.getLabel( error )}
      </div>}
      {max && <div className={`text-right ${max - value.length < 0 && 'text-danger' || ''}`}>
        {max - value.length}
      </div>}
    </div>
  );
}

export default Field;
