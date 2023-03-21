import { Component } from 'react';

export default class WigglyPoofComponent extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    e.preventDefault();

    const {
      onChange,
    } = this.props;

    onChange(e.target.value);
  }

  render() {
    const {
      field,
    } = this.props;

    const {
      field: name,
      placeholder,
    } = field;

    const { value } = this.props;

    const fieldProps = {
      name,
      rows: 3,
      className: 'form-control',
      value: value || '',
      placeholder,
      onChange: this.onChange,
    };

    return <input {...fieldProps} />;
  }
}
