"use strict";

const React = require( 'react' ),

  { reduxForm } = require( 'redux-form' ),

  { capitalize } = require( 'utils' ),

  { push } = require( 'react-router-redux' );


const ProfileSettings = React.createClass( {

  displayName: 'ProfileSettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  contextTypes: {
    getLabels: React.PropTypes.func
  },

  render: function () {

    const { getLabels } = this.context;

    const {
      activeTab, fields: { full_name, culture }, handleSubmit, displayModal, deleteAccount,
      successMessageDisplayed
    } = this.props;

    const deleteModal = {
      visible: true,
      title: getLabels( 'deleteMyAccount' ),
      content: <p>{getLabels( 'deleteModalText' )}</p>,
      action: deleteAccount,
      actionText: getLabels( 'deleteModalButton' )
    };

    return (
      <tr onClick={!activeTab ? this.props.dispatch.bind( this, push( '/profile' ) ) : null}>
        <td onClick={activeTab ? this.props.dispatch.bind( this, push( '/' ) ) : null}
            className="col-md-3" style={{cursor: 'pointer'}}>{getLabels( 'userProfile' )}
        </td>
        {activeTab ? <td>
          <div style={{padding: '0 5px'}}>
            <form onSubmit={handleSubmit} style={{paddingBottom: '8px'}}>
              <div className="form-group">
                <label htmlFor="full_name">{getLabels( 'fullname' )} *</label>
                <input type="text" className="form-control" name="full_name" {...full_name}/>
                {full_name.touched && full_name.error &&
                <div className="text-danger">{capitalize( getLabels( full_name.error ) )}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="culture">{getLabels( 'language' )} *</label>
                <select name="culture" className="form-control" {...culture}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
                {culture.touched && culture.error &&
                <div className="text-danger">{capitalize( getLabels( culture.error ) )}</div>}
              </div>

              <div className="form-inline pull-left">
                <button type="submit" className="btn btn-primary">{getLabels( 'save' )}</button>
                {successMessageDisplayed &&
                <label className="text-success" style={{marginLeft: '10px'}}>
                  <b>{getLabels( 'updateProfileSuccess' )}</b>
                </label>}
              </div>

              <div className="pull-right">
                <a href="#" className="text-danger" onClick={() => displayModal( deleteModal )}>
                  {getLabels( 'deleteMyAccount' )}
                </a>
              </div>
            </form>
          </div>
        </td> : <td style={{cursor: 'pointer'}}>{getLabels( 'modify' )}</td>}
      </tr>
    );

  }

} );

module.exports = reduxForm( {
  form: 'profileSettings',
  fields: [ 'full_name', 'culture' ]
} )( ProfileSettings );