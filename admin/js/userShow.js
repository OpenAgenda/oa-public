"use strict";

var React = require( 'react' ),

  remote = require( '../../js/lib/remote/remote.mod' );

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
        this.setState( { error: 'Erreur, mon pauvre doudou !' } );
        setTimeout( () => {
          this.setState( { error: null } );
        }, 3000 );
      } );
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
      </div>
    );

  }

} )