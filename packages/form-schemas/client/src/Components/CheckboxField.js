import React, { Fragment } from 'react';

module.exports = props => {

  const {
    options,
    field: name,
  } = props.field;

  const { value, onChange } = props;

  const defaultChecked = [].concat( props.field.default || [] );

  const checked = [].concat( value || defaultChecked );

  return <Fragment>
    {options.map( o => <div
      className="checkbox"
      key={[ name, o.value ].join('.')} >
      <label>
        <input
          type="checkbox"
          name={name}
          onChange={onChange.bind( null, checked.includes( o.id ) ? checked.filter( cId => cId !== o.id ) : checked.concat( o.id ) )}
          checked={checked.includes( o.id )} />
        {o.label}
      </label>
    </div> )}
  </Fragment>

}
