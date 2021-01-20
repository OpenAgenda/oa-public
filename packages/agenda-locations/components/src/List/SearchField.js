import React from 'react';
import PropTypes from 'prop-types';
import Spinner from '@openagenda/react-form-components/build/Spinner';

class SearchField extends React.Component {
  static defaultProps = {
    value: '',
    name: 'search',
    loading: false,
    onFocus: () => {}
  }

  static propTypes = {
    value: PropTypes.string,
    name: PropTypes.string,
    loading: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func,

  };

  constructor(props) {
    super(props);
    // Binding
    this.onChange = this.onChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onCommit = this.onCommit.bind(this);

  }

  onChange(e) {
    const { onChange } = this.props;
    onChange(e.target.value);
  }

  onFocus(e) {
    const { onFocus } = this.props;
    onFocus(e.target.value);
  }

  onCommit(e) {
    e.preventDefault();
    const { onChange, value } = this.props;

    if (typeof e.keyCode === 'undefined' || e.keyCode === 13) {
      onChange(value);
    }
  }

  renderSpinner() {
    return (
      <Spinner
        loading={true}
        spinner={{ width: 1, length: 3, radius: 4, color: '#666' }}
      />
    );
  }

  render() {
    const {
      dynamic, name, label, placeholder, value, loading
    } = this.props;
    return (
      <div className={dynamic ? 'search-field' : 'search-field input-group'}>

        <label className="sr-only" htmlFor={name}>{label}</label>
        <input
          placeholder={placeholder}
          type="text"
          className="form-control"
          onChange={this.onChange}
          onFocus={this.onFocus}
          onKeyUp={this.onCommit}
          value={value || ''}
        />
        <span className="input-group-btn">
          <button
            className="btn btn-default"
            type="button"
            onClick={this.onCommit}
          >
            { loading ? this.renderSpinner() : null }
            <i style={loading ? { visibility: 'hidden' } : {}} className="fa fa-search" />
          </button>
        </span>
      </div>
    );
  }
}

export default SearchField;
