import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  verify: {
    id: 'AgendaLocations.Filters.verify',
    defaultMessage: 'To verify',
  },
  locationSelection: {
    id: 'AgendaLocations.Filters.locationSelection',
    defaultMessage: 'Locations selection',
  },
  uncompletedLocations: {
    id: 'AgendaLocations.Filters.uncompletedLocations',
    defaultMessage: 'Uncompleted locations',
  },
});

class Filters extends Component {
  static propTypes = {
    locations: PropTypes.array.isRequired, // eslint-disable-line
    onQueryChange: PropTypes.func.isRequired,
    query: PropTypes.object.isRequired, // eslint-disable-line
    intl: PropTypes.object.isRequired // eslint-disable-line
  };

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
      intl
    } = this.props;
    if (field === 'hasNull') {
      return intl.formatMessage(messages.uncompletedLocations);
    } if (field === 'state') {
      return intl.formatMessage(messages.verify);
    } if (field === 'uids') {
      const selected = locations
        .filter(l => Object.values(value).map(v => parseInt(v, 10)).indexOf(l.uid) !== -1)
        .map(l => l.name);
      if (selected.length > 4 || !selected.length) {
        return intl.formatMessage(messages.locationSelection);
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

export default injectIntl(Filters);
