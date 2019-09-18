import React, { Component } from 'react';
import Switch from 'rc-switch';
import List from '@openagenda/react-components/build/List';

export default class UserShow extends Component {

  constructor( props ) {
    super( props );
    this.handleChangePassword = ::this.handleChangePassword;
    this.handleSubmitChangePassword = ::this.handleSubmitChangePassword;
    this.renderMember = ::this.renderMember;
    this.toggleApiSecret = ::this.toggleApiSecret;
  }

  state = {
    password: null
  };

  handleChangePassword( e ) {

    this.setState( { password: e.target.value } );

  }

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
  }

  renderMember( props ) {
    return (
      <tr key={props.id}>
        <td>{props.id}</td>
        <td>{roleToString( props.role )}</td>
        <td><a href={`/${props.agenda.slug}`}>{props.agenda.title}</a></td>
        <td>{props.nbrEvents || '0'}</td>
        <td><a href={`/admin/agendas?agendaUid=${props.agenda.uid}`}>Page admin/agendas</a></td>
        <td>
          <pre>{JSON.stringify( props.custom, null, 4 )}</pre>
        </td>
      </tr>
    );
  }

  toggleApiSecret() {

    this.props.onUserUpdate( { enable_secret: !(this.props.user.store && this.props.user.store.enable_secret) } );

  }

  render() {

    const user = this.props.user;
    let activationLink = '';

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
            <td>{user.email} {user.isRemoved ? <span style={{ color: 'brown' }}>Account removed</span> : null}</td>
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
          <tr>
            <td>Enable API secret</td>
            <td>
              <Switch
                ref="switch"
                className="rc-switch"
                checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
                unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
                onChange={this.toggleApiSecret}
                checked={!!user.apiSecret}
              />
            </td>
          </tr>
          </tbody>
        </table>
        <a onClick={this.props.onUserSignin} href="#">Signin as user</a><br />
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
              <th>admin/agendas</th>
              <th>Custom</th>
            </tr>
            </thead>
            <List
              items={this.props.members}
              renderItem={this.renderMember}
              renderEmpty={() => <tr>
                <td colSpan="5" className="text-center">N'est pas contributeur !</td>
              </tr>}
              getPage={() => null}
              wrapTag="tbody"
            />
          </table>
        </div>
      </div>
    );

  }

}

function roleToString( type ) {
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
