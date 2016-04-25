"use strict";

var React = require( "react" ),

  List = require( 'react-components/build/List' );

module.exports = React.createClass( {

  displayName: 'Details',

  propTypes: {
    agenda: React.PropTypes.object,
    stakeholders: React.PropTypes.array,
    pageRange: React.PropTypes.array,
    total: React.PropTypes.number,
    getStakeholdersPage: React.PropTypes.func,
    limit: React.PropTypes.number
  },
  
  getDefaultProps() {
    
    return {
      limit: 20
    };
    
  },

  renderAgendaHeader () {
    return (
      <header className="agenda-header">
        <div className="container-fluid profile notheme">
          <div className="row">{/*
           */}
            <div className="col-sm-2 avatar-container">

              <a href="#agendaShow%7B%22slug%22:%22la-gargouille%22%7D">
                <img className="avatar" src="//cibul.s3.amazonaws.com/review_cheznous_598_00.jpg"
                     alt="L'agenda de la Gargouille"/>
              </a>

            </div>
            {/*
             */}
            <div className="col-sm-7 title-container">
              <a href="#agendaShow%7B%22slug%22:%22la-gargouille%22%7D">
                <h1>{this.props.agenda.title}</h1>
                <p>{this.props.agenda.description}</p>
              </a>

              <p><a target="_blank" href="http://cibul.net">http://cibul.net</a></p>

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
        </tr>
        </thead>
        <List
          items={this.props.stakeholders}
          renderItem={this.renderStakeholderItem}
          renderEmpty={() => <tr><td colSpan="6" className="text-center">Y'a personne !</td></tr>}
          renderPrev={this.renderPrev}
          renderNext={this.renderNext}
          getPage={() => null}
          wrapTag="tbody"
        />
      </table>
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

  renderStakeholderItem( stakeholder ){

    return (
      <tr key={stakeholder.id}>
        <td><a href="#">{stakeholder.user.id}</a></td>
        <td>{stakeholder.credential}</td>
        <td>{stakeholder.user.full_name}</td>
        <td>{stakeholder.user.username}</td>
        <td>{stakeholder.user.email}</td>
        <td>le {stakeholder.user.created_at}</td>
      </tr>
    );

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