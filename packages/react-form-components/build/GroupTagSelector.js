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
    value: React.PropTypes.array,

    // optional renderer for additional component under tag item
    tagBottom: React.PropTypes.func,

    // optional list of tags that
    disabledTagIds: React.PropTypes.array
  },

  getDefaultProps: function getDefaultProps() {

    return {
      lang: 'en',
      getLabel: makeLabelGetter(labels),
      disabledTagIds: []
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

  renderItem: function renderItem(item, groupIndex, itemIndex) {

    var checked = this.props.value.map(function (v) {
      return v.id;
    }).indexOf(item.id) !== -1,
        isDisabled = this.props.disabledTagIds.indexOf(item.id) !== -1;

    return React.createElement(
      'div',
      { className: isDisabled ? 'checkbox disabled' : 'checkbox',
        key: item.id },
      React.createElement(
        'label',
        null,
        React.createElement('input', { type: 'checkbox', checked: checked, onChange: (checked ? this.removeItem : this.addItem).bind(null, item, groupIndex) }),
        item.label
      ),
      this.props.tagBottom ? this.props.tagBottom(item, groupIndex, itemIndex) : null
    );
  },

  renderGroupHead: function renderGroupHead(group, i) {

    var errors = [],
        displayError = false;

    try {

      // cleans and throws errors
      validator(this.props.set)(this.props.value, i);
    } catch (errs) {

      errors = errs;
    }

    if (errors.length && this.state.userHasTyped.indexOf(i) !== -1) {

      displayError = true;
    }

    return React.createElement(
      'div',
      { className: 'gt-head' },
      React.createElement(
        'label',
        { className: displayError ? 'error' : '' },
        group.name,
        group.required ? ' (*)' : ''
      ),
      group.info ? React.createElement(
        'p',
        null,
        group.info
      ) : null
    );
  },

  renderGroup: function renderGroup(group, i) {
    var _this = this;

    var groupIsDisabled = !group.tags.filter(function (t) {
      return _this.props.disabledTagIds.indexOf(t.id) == -1;
    }).length;

    return React.createElement(
      'div',
      { className: groupIsDisabled ? 'gt-group disabled' : 'gt-group', key: i },
      this.renderGroupHead(group, i),
      React.createElement(
        'div',
        { className: 'list-unstyled gt-selector-items' },
        group.tags.map(function (t, ti) {
          return _this.renderItem(t, i, ti);
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