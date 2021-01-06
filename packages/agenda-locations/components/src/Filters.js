import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Filters extends Component {
  static propTypes = {
    locations: PropTypes.array.isRequired,
    getLabel: PropTypes.func.isRequired,
    onQueryChange: PropTypes.func.isRequired,
    query: PropTypes.object.isRequired,
  };

class Filters extends Component {
  getFilterList() {
    const {
      query
    } = this.props;

    if (!query) return [];

    return Object.keys(query).reduce((carry, key) => carry.concat({
      key,
      value: query[key]
    }), []);
  }

  getLabel(field, value) {
    const {
      locations,
      getLabel
    } = this.props;

    if (field === 'state') {
      return getLabel('verify');
    } if (field === 'uids') {
      const selected = locations

        .filter(l => value.indexOf(l.uid) !== -1)

        .map(l => l.name);

      if (selected.length > 4 || !selected.length) {
        return getLabel('locationselection');
      }
      return selected.join(', ');
    }

    return value;
  }

  removeItem(f) {
    const { query, onQueryChange } = this.props;
    const rQuery = {};

    for (const i in query) {
      if (f !== i) {
        rQuery[i] = query[i];
      }
    }
    onQueryChange(rQuery);
  }

  renderItem(f) {
    return (
      <li
        key={f.key}
        className="btn btn-default filter-item"
        onClick={this.removeItem.bind(this, f.key)}
      >
        <span>{this.getLabel(f.key, f.value)}</span>
        <a>&#10005;</a>
      </li>
    );
  }

  render() {
    return (
      <ul className="list-unstyled">
        {this.getFilterList().map(this.renderItem.bind(this))}
      </ul>
    );
  }
}

export default Filters;
