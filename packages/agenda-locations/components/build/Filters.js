"use strict";

var React = require('react');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');

module.exports = createReactClass({
  displayName: 'exports',


  props: {
    query: PropTypes.object,
    onQueryChange: PropTypes.func,
    getLabel: PropTypes.func,
    locations: PropTypes.array
  },

  getFilterList: function getFilterList() {

    var arrayQuery = [];

    for (var i in this.props.query) {

      arrayQuery.push({ key: i, value: this.props.query[i] });
    }

    return arrayQuery;
  },

  removeItem: function removeItem(f) {

    var query = {};

    for (var i in this.props.query) {

      if (f !== i) {

        query[i] = this.props.query[i];
      }
    }

    this.props.onQueryChange(query);
  },

  getLabel: function getLabel(field, value) {

    if (field == 'state') {

      return this.props.getLabel('verify');
    } else if (field == 'uids') {

      var selected = this.props.locations.filter(function (l) {
        return value.indexOf(l.uid) !== -1;
      }).map(function (l) {
        return l.name;
      });

      if (selected.length > 4 || !selected.length) {

        return this.props.getLabel('locationselection');
      } else {

        return selected.join(', ');
      }
    }

    return value;
  },

  renderItem: function renderItem(f) {

    return React.createElement(
      'li',
      { key: f.key, className: 'btn btn-default filter-item', onClick: this.removeItem.bind(null, f.key) },
      React.createElement(
        'span',
        null,
        this.getLabel(f.key, f.value)
      ),
      React.createElement(
        'a',
        null,
        '\u2715'
      )
    );
  },

  render: function render() {

    return React.createElement(
      'ul',
      { className: 'list-unstyled' },
      this.getFilterList().map(this.renderItem)
    );
  }

});
//# sourceMappingURL=Filters.js.map