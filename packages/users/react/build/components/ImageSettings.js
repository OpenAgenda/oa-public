"use strict";

var React = require('react'),
    createReactClass = require('create-react-class'),
    PropTypes = require('prop-types'),
    ImageUpload = require('@openagenda/image-upload/components/build/ImageUploader'),
    _require = require('react-redux'),
    connect = _require.connect;

var ProfileSettings = createReactClass({

  displayName: 'ImageSettings',

  propTypes: {
    activeTab: PropTypes.bool
  },

  contextTypes: {
    lang: PropTypes.string,
    getLabels: PropTypes.func
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
        image = _props.image,
        prefix = _props.prefix;


    return React.createElement(
      'tr',
      {
        onClick: !activeTab ? routerActions.push.bind(null, prefix + '/image') : null,
        className: !activeTab ? 'inactive' : ''
      },
      React.createElement(
        'td',
        {
          onClick: activeTab ? routerActions.push.bind(null, prefix + '/') : null,
          className: 'col-md-3', style: { cursor: 'pointer' }
        },
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

});

module.exports = connect(function (state) {
  return { prefix: state.app.appSettings.prefix };
})(ProfileSettings);
//# sourceMappingURL=ImageSettings.js.map