import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImageUpload from '@openagenda/image-upload/components/build/ImageUploader';


@connect( state => ({
  prefix: state.settings.prefix,
  apiRoot: state.settings.apiRoot
}) )
export default class ImageSettings extends Component {
  static propTypes = {
    activeTab: PropTypes.bool
  };

  static contextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  render() {
    const { lang, getLabel } = this.context;
    const { activeTab, history, uploadImageRes, removeImageRes, onUpdate, image, prefix, apiRoot } = this.props;

    return (
      <tr
        onClick={!activeTab ? () => history.push( prefix + '/image' ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? () => history.push( prefix + '/' ) : null}
          className="col-md-3" style={{ cursor: 'pointer' }}
        >
          {getLabel( 'profileImage' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <ImageUpload
              lang={lang}
              value={image}
              handleUpdate={onUpdate}
              upload={apiRoot + uploadImageRes}
              remove={apiRoot + removeImageRes}
            />
          </div>
        </td> : <td style={{ cursor: 'pointer' }}>{getLabel( 'modify' )}</td>}
      </tr>
    );
  }
}
