'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const createReactClass = require('create-react-class');

module.exports = createReactClass({
  props: {
    query: PropTypes.object,
    onQueryChange: PropTypes.func,
    getLabel: PropTypes.func,
    locations: PropTypes.array,
  },

  getFilterList() {
    const arrayQuery = [];

    for (const i in this.props.query) {
      arrayQuery.push({ key: i, value: this.props.query[i] });
    }

    return arrayQuery;
  },

  removeItem(f) {
    const query = {};

    for (const i in this.props.query) {
      if (f !== i) {
        query[i] = this.props.query[i];
      }
    }

    this.props.onQueryChange(query);
  },

  getLabel(field, value) {
    if (field == 'state') {
      return this.props.getLabel('verify');
    } if (field == 'uids') {
      const selected = this.props.locations

        .filter(l => value.indexOf(l.uid) !== -1)

        .map(l => l.name);

      if (selected.length > 4 || !selected.length) {
        return this.props.getLabel('locationselection');
      }
      return selected.join(', ');
    }

    return value;
  },

  renderItem(f) {
    return (
      <li
        key={f.key}
        className="btn btn-default filter-item"
        onClick={this.removeItem.bind(null, f.key)}
      >
        <span>{this.getLabel(f.key, f.value)}</span>
        <a>&#10005;</a>
      </li>
    );
  },

  render() {
    return (
      <ul className="list-unstyled">
        {this.getFilterList().map(this.renderItem)}
      </ul>
    );
  },
});
