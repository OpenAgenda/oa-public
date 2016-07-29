"use strict";

var React = require( 'react' ),

  remote = require( '../../js/lib/remote/remote.mod' ),

  List = require( 'react-components/build/List' );

module.exports = React.createClass( {

  getInitialState() {
    return {
      password: null
    };
  },

  handleChangePassword( e ) {

    this.setState( { password: e.target.value } );

  },

  handleSubmitChangePassword( e ) {
    e.preventDefault();

    this.props.onUserChangePassword( { password: this.state.password } )
      .then( () => this.setState( { password: '' } ) )
      .catch( () => {
        this.setState( { error: 'Ho ben non hein, Pupuce !' } );
        setTimeout( () => {
          this.setState( { error: null } );
        }, 3000 );
      } );
  },

  renderStakeholder( props ) {
    return (
      <tr key={props.id}>
        <td>{props.id}</td>
        <td>{credentialToString( props.credential )}</td>
        <td><a href={`/${props.agenda.slug}`}>{props.agenda.title}</a></td>
        <td>{props.nbrEvents}</td>
        <td><pre>{JSON.stringify( props.custom, null, 4 )}</pre></td>
      </tr>
    );
  },

  render: function () {

    var user = this.props.user,

      activationLink = '';

    if ( !user ) {

      return (
        <div>
          <p>Click on a user for details</p>
        </div>
      );

    }


    if ( !user.isActivated ) {

      activationLink = <span> - <a onClick={this.props.onUserActivation} href="#">activate</a></span>

    }

    return (
      <div>
        <h2>{user.fullName}</h2>
        <table className="table">
          <tbody>
          <tr>
            <td>uid</td>
            <td>{user.uid}</td>
          </tr>
          <tr>
            <td>email</td>
            <td>{user.email}</td>
          </tr>
          <tr>
            <td>is activated?</td>
            <td>
              <span>{user.isActivated ? "yes" : "no"}</span>
              {activationLink}
            </td>
          </tr>
          <tr>
            <td>Created At</td>
            <td>{user.createdAt}</td>
          </tr>
          <tr>
            <td>Updated At</td>
            <td>{user.updatedAt}</td>
          </tr>
          <tr>
            <td>Last signin</td>
            <td>{user.lastSignin}</td>
          </tr>
          </tbody>
        </table>
        <a onClick={this.props.onUserSignin} href="#">Signin as user</a><br/>
        <form className="form-inline" onSubmit={this.handleSubmitChangePassword}>
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe: </label>
            <input
              type="text"
              className="form-control"
              id="password"
              placeholder="No error allowed babe"
              value={this.state.password}
              onChange={this.handleChangePassword}
            />
          </div>
          <button type="submit" className="btn btn-default">Change password</button>
        </form>
        {this.state.error && <div className="text-danger"><b>{this.state.error}</b></div>}
        <div>
          <table className="table table-striped table-hover">
            <thead>
            <tr>
              <th>#</th>
              <th>Rôle</th>
              <th>Agenda</th>
              <th>Nombre d'événements</th>
              <th>Custom</th>
            </tr>
            </thead>
            <List
              items={this.props.stakeholders}
              renderItem={this.renderStakeholder}
              renderEmpty={() => <tr><td colSpan="4" className="text-center">N'est pas contributeur !</td></tr>}
              getPage={() => null}
              wrapTag="tbody"
            />
          </table>
        </div>
      </div>
    );

  }

} );

function credentialToString( type ) {
  switch ( type ) {
    case 1:
      return 'Contributeur';
    case 2:
      return 'Administrateur';
    case 3:
      return 'Modérateur';
    default:
      return 'Inconnu';
  }
}