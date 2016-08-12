"use strict";

var React = require( "react" ),

  List = require( 'react-components/build/List' ),

  Switch = require( 'rc-switch' );


module.exports = React.createClass( {

  displayName: 'Details',

  propTypes: {
    agenda: React.PropTypes.object,
    stakeholders: React.PropTypes.array,
    pageRange: React.PropTypes.array,
    total: React.PropTypes.number,
    getStakeholdersPage: React.PropTypes.func,
    setAgenda: React.PropTypes.func,
    limit: React.PropTypes.number
  },

  getDefaultProps() {

    return {
      limit: 20
    };

  },

  setOfficial( checked ){

    this.props.setAgenda( { official: checked } );

  },

  renderAgendaHeader () {
    return (
      <header className="agenda-header">
        <div className="container-fluid profile notheme">
          <div className="row">
            { this.props.agenda.image ?
              <div className="col-sm-2 avatar-container">
                <a href="#"> <img className="avatar" src={'https://cibul.s3.amazonaws.com/' + this.props.agenda.image}
                                  alt={this.props.agenda.title} /> </a>
              </div> : null }

            <div className={ this.props.agenda.image ? 'col-sm-7 title-container' : 'title-container' }>
              <a href="#">
                <h1>{this.props.agenda.title}</h1>
                <p>{this.props.agenda.description}</p>
              </a> { this.props.agenda.url ?
              <p><a target="_blank" href={this.props.agenda.url}>{this.props.agenda.url}</a></p> : null }<p>
              {this.props.agenda && <div>Agenda officiel <Switch
                ref="switch"
                className="rc-switch"
                checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
                unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
                onChange={this.setOfficial}
                checked={!!this.props.agenda.official}
              /></div>}
            </p>
            </div>
          </div>
        </div>
      </header>
    );
  },

  renderStakeholdersTable() {

    return (
      <table className="table table-striped table-hover">
        <thead>
        <tr>
          <th>#</th>
          <th>Type</th>
          <th>Nom complet</th>
          <th>Nom d'utilisateur</th>
          <th>Email</th>
          <th>Depuis</th>
          <th>Actions</th>
        </tr>
        </thead>
        <List
          items={this.props.stakeholders}
          renderItem={this.renderStakeholderItem}
          renderEmpty={() => <tr>
            <td colSpan="6" className="text-center">Y'a personne !</td>
          </tr>}
          renderPrev={this.renderPrev}
          renderNext={this.renderNext}
          getPage={() => null}
          wrapTag="tbody"
        />
      </table>
    );

  },

  renderStakeholderItem( stakeholder ){

    return (
      <tr key={stakeholder.id}>
        <td><a href="#">{stakeholder.user.uid}</a></td>
        <td>{credentialsToString( stakeholder.credential )}</td>
        <td>{stakeholder.user.full_name}</td>
        <td>{stakeholder.user.username}</td>
        <td>{stakeholder.user.email}</td>
        <td>le {stakeholder.user.created_at}</td>
        <td><a href={'/admin/users/signin?uid=' + stakeholder.user.uid}><i className="fa fa-sign-in"
                                                                           aria-hidden="true"></i></a></td>
      </tr>
    );

  },

  renderPrev(){

    if ( this.hasPrevPage() ) {
      return <tr>
        <td colSpan="6" className="text-center">
          <button className="btn btn-default"
                  onClick={this.props.getStakeholdersPage.bind( null, false )}>Précédent
          </button>
        </td>
      </tr>;
    }

  },

  renderNext(){

    if ( this.hasNextPage() ) {
      return <tr>
        <td colSpan="6" className="text-center">
          <button className="btn btn-default"
                  onClick={this.props.getStakeholdersPage.bind( null, true )}>Suivant
          </button>
        </td>
      </tr>;
    }

  },

  hasNextPage() {

    var lastPage = this.props.pageRange[ 1 ];

    return lastPage * this.props.limit < this.props.total;

  },

  hasPrevPage() {

    return this.props.pageRange[ 0 ] > 1;

  },

  render(){

    return <div className="col-md-9">
      <div className="row">
        {this.props.agenda ? this.renderAgendaHeader() : ''}

        {this.props.stakeholders ? this.renderStakeholdersTable() : ''}
      </div>
    </div>;

  }

} );

function credentialsToString( type ) {
  switch ( type ) {
    case 1:
      return 'Contributeur';
    case 2:
      return 'Administrateur';
    case 3:
      return 'Modérateur';
    default:
      'Inconnu'
  }
}