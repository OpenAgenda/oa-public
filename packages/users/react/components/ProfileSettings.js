"use strict";

const React = require( 'react' ),

  { Link } = require( 'react-router' ),

  { reduxForm } = require( 'redux-form' );


var ProfileSettings = React.createClass( {

  displayName: 'ProfileSettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  render: function() {

    const { activeTab, fields: { fullname, culture }, handleSubmit } = this.props;

    return (
      <div>
        { activeTab ?
          <div className="panel-group">
            <div className="panel panel-primary">
              <div className="panel-heading">Profil utilisateur</div>
              <div className="panel-body">

                <form onSubmit={handleSubmit}>
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

                  <p className="pull-left">
                    <button type="button" className="btn btn-danger">Supprimer mon compte</button>
                  </p>

                  <div className="text-right">
                    <button type="submit" className="btn btn-success">Sauvegarder</button>
                  </div>
                </form>

              </div>
            </div>
          </div> : <p><Link to="/profile">Profil utilisateur</Link></p> }
      </div>
    );

  }

} );

module.exports = reduxForm( {
  form: 'profileSettings',
  fields: [ 'fullname', 'culture' ],
  initialValues: { culture: 'fr' }
} )( ProfileSettings );