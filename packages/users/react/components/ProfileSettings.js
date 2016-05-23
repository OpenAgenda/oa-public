"use strict";

const React = require( 'react' ),

  { Link } = require( 'react-router' ),

  { reduxForm } = require( 'redux-form' );


const ProfileSettings = React.createClass( {

  displayName: 'ProfileSettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  render: function() {

    const { activeTab, fields: { fullname, culture }, handleSubmit } = this.props;

    return (
      activeTab ?
        <div>
          <h4><i className="fa fa-caret-down" aria-hidden="true"></i> Profil utilisateur</h4>

          <div style={{padding: '0 5px'}}>
            <form onSubmit={handleSubmit} style={{paddingBottom: '8px'}}>
              <div className="form-group">
                <label htmlFor="fullname">Nom complet *</label>
                <input type="text" className="form-control" name="fullname" {...fullname}/>
              </div>

              <div className="form-group">
                <label htmlFor="culture">Langue *</label>
                <select name="culture" className="form-control" {...culture}>
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                </select>
              </div>

              <button type="submit" className="btn btn-success">Sauvegarder</button>

              <div className="pull-right">
                <a href="#" className="text-danger">Supprimer mon compte</a>
              </div>
            </form>
          </div>
        </div> :
        <h4><Link to="/profile"><i className="fa fa-caret-right" aria-hidden="true"></i> Profil utilisateur</Link></h4>
    );

  }

} );

module.exports = reduxForm( {
  form: 'profileSettings',
  fields: [ 'fullname', 'culture' ]
} )( ProfileSettings );