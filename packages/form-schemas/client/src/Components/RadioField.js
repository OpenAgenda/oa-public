import React, { Fragment, Component } from 'react';
import Select from 'react-select';

import formSchemaLabels from '@openagenda/labels/form-schemas';
import makeLabelGetter from '@openagenda/labels';

const getLabel = makeLabelGetter(formSchemaLabels);

export default class RadioField extends Component {
  constructor(props) {
    super(props);
    this.state = { hasClicked: false };
  }

  onChange(optionId) {
    this.setState({ hasClicked: true });

    this.props.onChange(optionId);
  }

  isChecked(optionId) {
    const { hasClicked } = this.state;
    const { value, field } = this.props;

    if (!hasClicked && !value && field.default) {
      return optionId === field.default;
    }

    return optionId === value;
  }

  render() {
    const {
      options,
      field: name,
      optional
    } = this.props.field;

    const { value, lang } = this.props;

    return <Fragment>
      {options.filter(o => o.display).concat(optional ? [ {
        label: getLabel('noChoice', lang),
        id: null
      } ] : []).map(o => <div
        className="radio"
        key={[name, o.value].join('.')} >
        <label>
          <input
            type="radio"
            name={name}
            onChange={this.onChange.bind(this, o.id)}
            checked={this.isChecked(o.id)} />
          {o.label}
          {o.info && <div className="text-muted">{o.info}</div>}
        </label>
      </div>)}
    </Fragment>
  }

}
