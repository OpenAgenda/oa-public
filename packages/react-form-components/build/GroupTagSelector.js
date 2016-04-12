"use strict";

var React = require('react'),
    makeLabelGetter = require('../lib/makeLabelGetter'),
    validator = require('../validators/groupTags'),
    labels = require('../labels');

module.exports = React.createClass({

  displayName: 'GroupTagSelector',

  propTypes: {

    lang: React.PropTypes.string,

    // name of component set, given back on callback value
    name: React.PropTypes.string.isRequired,

    // set of tag groups
    set: React.PropTypes.object,

    // used by component to load labels
    getLabel: React.PropTypes.func,

    // current tag selection
    value: React.PropTypes.array

  },

  getDefaultProps: function getDefaultProps() {

    return {
      lang: 'en',
      getLabel: makeLabelGetter(labels)
    };
  },

  getInitialState: function getInitialState() {

    return {
      userHasTyped: []
    };
  },

  addItem: function addItem(item, groupIndex) {

    this.setState({
      userHasTyped: this.state.userHasTyped.concat([groupIndex])
    });

    this.props.onChange(this.props.name, this.props.value.concat(item));
  },

  getErrors: function getErrors() {

    return [];
  },

  removeItem: function removeItem(item, groupIndex) {

    var newSelection = this.props.value.filter(function (vItem) {

      return item.id !== vItem.id;
    });

    this.setState({
      userHasTyped: this.state.userHasTyped.concat([groupIndex])
    });

    this.props.onChange(this.props.name, newSelection);
  },

  renderItem: function renderItem(item, groupIndex) {

    var self = this,
        selected = this.props.value.map(function (v) {
      return v.id;
    }).indexOf(item.id) !== -1;

    return React.createElement(
      'li',
      {
        key: item.id,
        onClick: (selected ? this.removeItem : this.addItem).bind(null, item, groupIndex),
        className: selected ? 'active' : '' },
      React.createElement(
        'span',
        null,
        item.label
      )
    );
  },

  renderInfo: function renderInfo(group, i) {

    // if there is an error ( and user has typed ), render that

    var errors = [],
        self = this;

    try {

      validator(this.props.set)(this.props.value, i);
    } catch (e) {
      errors = e;
    };

    if (this.state.userHasTyped.indexOf(i) !== -1 && errors.length) {

      return React.createElement(
        'p',
        null,
        errors.map(function (error) {

          return React.createElement(
            'span',
            {
              key: error.code,
              className: 'error' },
            self.props.getLabel(error.code, error.values, self.props.lang)
          );
        })
      );
    }

    return React.createElement(
      'p',
      null,
      group.required ? React.createElement(
        'span',
        null,
        this.props.getLabel('required', this.props.lang)
      ) : null,
      group.required && group.info ? ' - ' : null,
      group.info ? React.createElement(
        'span',
        null,
        group.info
      ) : null
    );
  },

  renderGroup: function renderGroup(group, i) {

    var self = this,
        errors = [];

    try {

      // cleans and throws errors
      validator(this.props.set, this.props.value, i);
    } catch (errs) {

      errors = errs;
    }

    return React.createElement(
      'div',
      { className: 'gt-group' },
      React.createElement(
        'div',
        { className: 'gt-head' },
        React.createElement(
          'h2',
          null,
          group.name
        ),
        this.renderInfo(group, i)
      ),
      React.createElement(
        'ul',
        { className: 'list-unstyled gt-selector-items' },
        group.tags.map(function (t) {
          return self.renderItem(t, i);
        })
      )
    );
  },

  render: function render() {

    return React.createElement(
      'div',
      { className: 'gt-selector' },
      this.props.set.groups.map(this.renderGroup)
    );
  }

});