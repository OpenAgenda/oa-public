"use strict";

const React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),

  PropTypes = require( 'prop-types' ),

  ImageUpload = require( '@openagenda/image-upload/components/build/ImageUploader' ),

  { connect } = require( 'react-redux' );


const ProfileSettings = createReactClass( {

  displayName: 'ImageSettings',

  propTypes: {
    activeTab: PropTypes.bool
  },

  contextTypes: {
    lang: PropTypes.string,
    getLabels: PropTypes.func
  },

  render: function () {

    const { lang, getLabels } = this.context;

    const { activeTab, routerActions, uploadImageRes, removeImageRes, onUpdate, image, prefix } = this.props;

    return (
      <tr
        onClick={!activeTab ? routerActions.push.bind( null, prefix + '/image' ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? routerActions.push.bind( null, prefix + '/' ) : null}
          className="col-md-3" style={{ cursor: 'pointer' }}
        >
          {getLabels( 'profileImage' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <ImageUpload
              lang={lang}
              value={image}
              handleUpdate={onUpdate}
              upload={uploadImageRes}
              remove={removeImageRes}
            />
          </div>
        </td> : <td style={{ cursor: 'pointer' }}>{getLabels( 'modify' )}</td>}
      </tr>
    );

  }

} );

module.exports = connect( state => ({ prefix: state.app.appSettings.prefix }) )( ProfileSettings );