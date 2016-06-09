"use strict";

const React = require( 'react' ),

  ImageUpload = require( 'image-upload/components/src/ImageUploader' );


const ProfileSettings = React.createClass( {

  displayName: 'ImageSettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  contextTypes: {
    lang: React.PropTypes.string,
    getLabels: React.PropTypes.func
  },

  render: function () {

    const { lang, getLabels } = this.context;

    const { activeTab, routerActions, uploadImageRes, removeImageRes, onUpdate, image } = this.props;

    return (
      <tr onClick={!activeTab ? routerActions.push.bind( null, '/image' ) : null}>
        <td onClick={activeTab ? routerActions.push.bind( null, '/' ) : null}
            className="col-md-3" style={{cursor: 'pointer'}}>{getLabels( 'profileImage' )}
        </td>
        {activeTab ? <td>
          <div style={{padding: '0 5px'}}>
            <ImageUpload
              lang={lang}
              value={image}
              handleUpdate={onUpdate}
              upload={uploadImageRes}
              remove={removeImageRes}
            />
          </div>
        </td> : <td style={{cursor: 'pointer'}}>{getLabels( 'modify' )}</td>}
      </tr>
    );

  }

} );

module.exports = ProfileSettings;