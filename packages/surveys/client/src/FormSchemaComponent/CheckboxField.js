import React, { Component, Fragment } from 'react';

module.exports = class CheckboxField extends Component {

  render() {

    const {
      options,
      field: name,
    } = this.props.field;

    const { value, onChange } = this.props;

    return <Fragment>
      {options.map( o => <div
        className="checkbox"
        key={[ name, o.value ].join('.')} >
        <label>
          <input
            type="checkbox"
            name={name}
            value={o.value}
            onChange={onChange.bind( null, o.value===value ? null : o.value )}
            checked={o.value===value} />
          {o.label}
        </label>
      </div> )}
    </Fragment>

  }

}
