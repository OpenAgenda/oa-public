"use strict";

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  ImageSettings: {
    displayName: 'ImageSettings'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/ImageSettings.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var React = require('react'),
    ImageUpload = require('image-upload/components/build/ImageUploader');

var ProfileSettings = _wrapComponent('ImageSettings')(React.createClass({

  displayName: 'ImageSettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  contextTypes: {
    lang: React.PropTypes.string,
    getLabels: React.PropTypes.func
  },

  render: function render() {
    var _context = this.context,
        lang = _context.lang,
        getLabels = _context.getLabels;
    var _props = this.props,
        activeTab = _props.activeTab,
        routerActions = _props.routerActions,
        uploadImageRes = _props.uploadImageRes,
        removeImageRes = _props.removeImageRes,
        onUpdate = _props.onUpdate,
        image = _props.image;


    return React.createElement(
      'tr',
      {
        onClick: !activeTab ? routerActions.push.bind(null, '/image') : null,
        className: !activeTab ? 'inactive' : ''
      },
      React.createElement(
        'td',
        { onClick: activeTab ? routerActions.push.bind(null, '/') : null,
          className: 'col-md-3', style: { cursor: 'pointer' } },
        getLabels('profileImage')
      ),
      activeTab ? React.createElement(
        'td',
        null,
        React.createElement(
          'div',
          { style: { padding: '0 5px' } },
          React.createElement(ImageUpload, {
            lang: lang,
            value: image,
            handleUpdate: onUpdate,
            upload: uploadImageRes,
            remove: removeImageRes
          })
        )
      ) : React.createElement(
        'td',
        { style: { cursor: 'pointer' } },
        getLabels('modify')
      )
    );
  }

}));

module.exports = ProfileSettings;